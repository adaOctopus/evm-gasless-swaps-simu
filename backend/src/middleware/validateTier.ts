import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { UserTier } from '../config/env';
import { JwtPayload } from './auth';

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export const requireTier = (minTier: UserTier) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const payload = (req as RequestWithUser).user;
    if (!payload?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await User.findById(payload.userId).exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const order: UserTier[] = ['FREE', 'PRO', 'MASTER'];
    if (order.indexOf(user.tier) < order.indexOf(minTier)) {
      res.status(403).json({ error: `Tier ${minTier} or higher required` });
      return;
    }
    next();
  };
};
