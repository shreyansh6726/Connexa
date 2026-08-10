import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.post('/apply', authMiddleware, requireRole(['EMPLOYEE']), ApplicationController.apply);
router.get('/employer', authMiddleware, requireRole(['EMPLOYER', 'ADMIN']), ApplicationController.getEmployerApplications);
router.get('/employee', authMiddleware, requireRole(['EMPLOYEE']), ApplicationController.getEmployeeApplications);
router.put('/:id/status', authMiddleware, requireRole(['EMPLOYER', 'ADMIN']), ApplicationController.updateStatus);

export default router;
