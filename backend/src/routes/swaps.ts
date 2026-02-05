import { Router } from 'express';
import { createSwap, listSwaps } from '../controllers/swapController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);
router.post('/', createSwap as any);
router.get('/', listSwaps as any);
export default router;
