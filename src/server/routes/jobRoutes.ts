import { Router } from 'express';
import { JobController } from '../controllers/jobController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', JobController.getJobs);
router.get('/candidates', authMiddleware, JobController.getCandidates);
router.get('/:id', JobController.getJobById);
router.post('/', authMiddleware, requireRole(['EMPLOYER', 'ADMIN']), JobController.createJob);
router.put('/:id', authMiddleware, requireRole(['EMPLOYER', 'ADMIN']), JobController.updateJob);

export default router;
