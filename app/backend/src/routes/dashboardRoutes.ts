import { Router } from 'express';
import { getDashboardStats, getRecentSales, getSalesChartData, getLowStock, getExpiringItems } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/recent-sales', getRecentSales);
router.get('/sales-chart', getSalesChartData);
router.get('/low-stock', getLowStock);
router.get('/expiring-items', getExpiringItems);

export default router;
