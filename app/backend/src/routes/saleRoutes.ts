import { Router } from 'express';
import { getSales, getSale, createSale, getSalesSummary } from '../controllers/saleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getSales);
router.get('/summary', getSalesSummary);
router.get('/:id', getSale);
router.post('/', createSale);

export default router;
