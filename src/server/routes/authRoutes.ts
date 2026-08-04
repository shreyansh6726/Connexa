import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authMiddleware, AuthController.me);
router.put('/profile', authMiddleware, AuthController.updateProfile);

export default router;
