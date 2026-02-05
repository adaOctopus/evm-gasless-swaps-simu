import { Response } from 'express';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { JwtPayload } from '../middleware/auth';
import { RequestWithUser } from '../middleware/validateTier';

export async function getMe(req: RequestWithUser, res: Response): Promise<void> {
  try {
    const payload = req.user;
    if (!payload?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await User.findById(payload.userId).select('-__v').exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const wallets = await Wallet.find({ userId: payload.userId }).exec();
    res.json({
      user: { id: user._id, email: user.email, tier: user.tier, createdAt: user.createdAt },
      wallets: wallets.map((w) => ({ address: w.address, type: w.type, chainId: w.chainId, isDefault: w.isDefault })),
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function updateTier(req: RequestWithUser, res: Response): Promise<void> {
  try {
    const payload = req.user;
    const { tier } = req.body as { tier: 'FREE' | 'PRO' | 'MASTER' };
    if (!payload?.userId || !tier || !['FREE', 'PRO', 'MASTER'].includes(tier)) {
      res.status(400).json({ error: 'Valid tier required' });
      return;
    }
    const user = await User.findByIdAndUpdate(payload.userId, { tier }, { new: true }).exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: { id: user._id, email: user.email, tier: user.tier } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update tier' });
  }
}
