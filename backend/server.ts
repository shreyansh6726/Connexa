import cors from 'cors';
import express from 'express';

import { db } from './src/server/db';
import { authMiddleware, requireRole } from './src/server/middleware/auth';
import aiRoutes from './src/server/routes/aiRoutes';
import applicationRoutes from './src/server/routes/applicationRoutes';
import authRoutes from './src/server/routes/authRoutes';
import jobRoutes from './src/server/routes/jobRoutes';
import notificationRoutes from './src/server/routes/notificationRoutes';

async function startServer() {
  await db.initialize();
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Connexa Backend API', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Admin specific endpoints
  app.get('/api/admin/stats', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
    const users = await db.getAllUsers();
    const jobs = await db.getJobs();
    const apps = await db.getAllApplications();

    res.json({
      totalUsers: users.length,
      employees: users.filter((u) => u.role === 'EMPLOYEE').length,
      employers: users.filter((u) => u.role === 'EMPLOYER').length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
      totalJobs: jobs.length,
      openJobs: jobs.filter((j) => j.status === 'OPEN').length,
      totalApplications: apps.length,
    });
  });

  app.get('/api/admin/users', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
    const users = await db.getAllUsers();
    res.json({ users });
  });

  app.get('/', (req, res) => {
    res.json({ service: 'Connexa Backend API', status: 'ok' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Connexa server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
