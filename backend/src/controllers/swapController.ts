import { Response } from 'express';
import { Swap } from '../models/Swap';
import { JwtPayload } from '../middleware/auth';
import { RequestWithUser } from '../middleware/validateTier';

export async function createSwap(req: RequestWithUser, res: Response): Promise<void> {
  try {
    const payload = req.user;
    if (!payload?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { walletAddress, chainId, tokenIn, tokenOut, amountIn, amountOut, txHash, userOpHash } = req.body as {
      walletAddress: string;
      chainId: number;
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      amountOut: string;
      txHash?: string;
      userOpHash?: string;
    };
    if (!walletAddress || chainId == null || !tokenIn || !tokenOut || amountIn == null || amountOut == null) {
      res.status(400).json({ error: 'walletAddress, chainId, tokenIn, tokenOut, amountIn, amountOut required' });
      return;
    }
    const swap = await Swap.create({
      userId: payload.userId,
      walletAddress,
      chainId,
      tokenIn,
      tokenOut,
      amountIn: String(amountIn),
      amountOut: String(amountOut),
      txHash,
      userOpHash,
    });
    res.status(201).json({ swap: { id: swap._id, userOpHash: swap.userOpHash, createdAt: swap.createdAt } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to record swap' });
  }
}

export async function listSwaps(req: RequestWithUser, res: Response): Promise<void> {
  try {
    const payload = req.user;
    if (!payload?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const limit = Math.min(parseInt(String(req.query.limit), 10) || 20, 100);
    const swaps = await Swap.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    res.json({ swaps });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list swaps' });
  }
}
