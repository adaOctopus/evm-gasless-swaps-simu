import { Router } from 'express';
import { getMe, updateTier } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);
router.get('/me', getMe as any);
router.patch('/me', updateTier as any);
export default router;
