import { Router } from 'express';
import {
  getSalesReport,
  getInventoryReport,
  getProfitLossReport,
  getPrescriptionReport,
  getTopMedicines,
  getCustomerPurchaseHistory,
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/profit-loss', authorize('admin'), getProfitLossReport);
router.get('/prescriptions', getPrescriptionReport);
router.get('/top-medicines', getTopMedicines);
router.get('/customer-history/:id', getCustomerPurchaseHistory);

export default router;
