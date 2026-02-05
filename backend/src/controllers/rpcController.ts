import { Response } from 'express';
import { User } from '../models/User';
import { getPaymasterAndData } from '../services/alchemyGasManager';
import { sendUserOperation } from '../services/alchemyBundler';
import { JwtPayload } from '../middleware/auth';
import { RequestWithUser } from '../middleware/validateTier';

export async function paymasterData(req: RequestWithUser, res: Response): Promise<void> {
  try {
    const payload = req.user;
    if (!payload?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await User.findById(payload.userId).exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { userOp, chainId } = req.body as { userOp: Record<string, unknown>; chainId?: number };
    if (!userOp) {
      res.status(400).json({ error: 'userOp required' });
      return;
    }
    const result = await getPaymasterAndData({ userOp, tier: user.tier, chainId });
    res.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Paymaster request failed';
    res.status(500).json({ error: message });
  }
}

export async function sendUserOp(req: RequestWithUser, res: Response): Promise<void> {
  try {
    const payload = req.user;
    if (!payload?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { userOp, chainId } = req.body as { userOp: Record<string, unknown>; chainId?: number };
    if (!userOp) {
      res.status(400).json({ error: 'userOp required' });
      return;
    }
    const result = await sendUserOperation({ userOp, chainId });
    res.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Send UserOp failed';
    res.status(500).json({ error: message });
  }
}
