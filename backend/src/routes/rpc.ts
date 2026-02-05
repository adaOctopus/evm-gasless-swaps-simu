import { Router } from 'express';
import { paymasterData, sendUserOp, submit7702 } from '../controllers/rpcController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);
router.post('/paymaster-data', paymasterData as any);
router.post('/send-userop', sendUserOp as any);
router.post('/submit-7702', submit7702 as any);
export default router;
