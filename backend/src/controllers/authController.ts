import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyMessage } from 'viem';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { config } from '../config/env';
import { JwtPayload } from '../middleware/auth';

const WALLET_SIGNIN_MESSAGE_PREFIX = 'Sign in to One-Click Gasless Swap\n\n';

export async function socialLogin(req: Request, res: Response): Promise<void> {
  try {
    const email = req.body?.email as string | undefined;
    const authProvider = (req.body?.authProvider ?? 'google') as string;
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }
    let user = await User.findOne({ email }).exec();
    if (!user) {
      user = await User.create({ email, authProvider, tier: 'FREE' });
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, email: user.email, tier: user.tier } });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function linkWallet(req: Request, res: Response): Promise<void> {
  try {
    const payload = (req as Request & { user: JwtPayload }).user;
    const { address, type, chainId } = req.body as { address: string; type: 'eoa' | 'smart_account'; chainId: number };
    if (!payload?.userId || !address || !type || chainId == null) {
      res.status(400).json({ error: 'userId, address, type, chainId required' });
      return;
    }
    const existing = await Wallet.findOne({ userId: payload.userId, address }).exec();
    if (existing) {
      res.json({ wallet: existing });
      return;
    }
    const isFirst = (await Wallet.countDocuments({ userId: payload.userId })) === 0;
    const wallet = await Wallet.create({
      userId: payload.userId,
      address,
      type,
      chainId,
      isDefault: isFirst,
    });
    res.status(201).json({ wallet });
  } catch (e) {
    res.status(500).json({ error: 'Link wallet failed' });
  }
}

/** Wallet sign-in: verify EOA signature, find or create user, link wallet, return JWT */
export async function walletSignIn(req: Request, res: Response): Promise<void> {
  try {
    const { address, signature, message } = req.body as {
      address: string;
      signature: `0x${string}`;
      message: string;
    };
    if (!address || !signature || !message) {
      res.status(400).json({ error: 'address, signature, message required' });
      return;
    }
    const recovered = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature,
    });
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
    let user = await User.findOne({ email: `${address.toLowerCase()}@wallet.local` }).exec();
    if (!user) {
      user = await User.create({
        email: `${address.toLowerCase()}@wallet.local`,
        authProvider: 'wallet',
        tier: 'FREE',
      });
    }
    const existingWallet = await Wallet.findOne({ userId: user._id, address: address.toLowerCase() }).exec();
    if (!existingWallet) {
      await Wallet.create({
        userId: user._id,
        address: address.toLowerCase(),
        type: 'eoa',
        chainId: 11155111,
        isDefault: true,
      });
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: user._id, email: user.email, tier: user.tier },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Wallet sign-in failed';
    res.status(500).json({ error: msg });
  }
}

export function getWalletSignInMessage(): string {
  return `${WALLET_SIGNIN_MESSAGE_PREFIX}Timestamp: ${Date.now()}`;
}
