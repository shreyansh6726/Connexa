import { Router } from 'express';
import { AiController } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/match', authMiddleware, AiController.calculateMatch);
router.post('/generate-bio', authMiddleware, AiController.generateBio);
router.post('/enhance-job', authMiddleware, AiController.enhanceJob);

export default router;
