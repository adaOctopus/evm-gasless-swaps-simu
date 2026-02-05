import { Router } from 'express';
import { paymasterData, sendUserOp } from '../controllers/rpcController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);
router.post('/paymaster-data', paymasterData as any);
router.post('/send-userop', sendUserOp as any);
export default router;
