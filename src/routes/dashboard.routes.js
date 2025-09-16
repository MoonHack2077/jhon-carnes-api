import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Solo los admins pueden ver el dashboard
router.get('/summary', [verifyToken, isAdmin], getDashboardSummary);

export default router;