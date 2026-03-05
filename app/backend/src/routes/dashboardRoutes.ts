import { Router } from 'express';
import { getDashboardStats, getRecentSales, getSalesChartData } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/recent-sales', getRecentSales);
router.get('/sales-chart', getSalesChartData);

export default router;
