import { Router } from 'express';
import { socialLogin, linkWallet, walletSignIn } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();
router.post('/social', socialLogin);
router.post('/wallet-signin', walletSignIn);
router.post('/link-wallet', auth, linkWallet);
export default router;
