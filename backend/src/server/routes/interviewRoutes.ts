import { Router } from 'express';
import { InterviewController } from '../controllers/interviewController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Candidate endpoints
router.post('/start', authMiddleware, InterviewController.startInterview);
router.post('/:id/answer', authMiddleware, InterviewController.submitAnswer);
router.get('/candidate/my', authMiddleware, InterviewController.getMyInterviews);

// View interview
router.get('/:id', authMiddleware, InterviewController.getInterview);
router.get('/application/:applicationId', authMiddleware, InterviewController.getApplicationInterview);

export default router;
