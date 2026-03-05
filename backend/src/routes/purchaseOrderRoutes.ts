import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  getPurchaseOrderStats,
} from '../controllers/purchaseOrderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getPurchaseOrders);
router.get('/stats', getPurchaseOrderStats);
router.get('/:id', getPurchaseOrder);
router.post('/', authorize('admin', 'inventory_manager'), createPurchaseOrder);
router.put('/:id', authorize('admin', 'inventory_manager'), updatePurchaseOrder);
router.put('/:id/approve', authorize('admin'), approvePurchaseOrder);
router.put('/:id/receive', authorize('admin', 'inventory_manager'), receivePurchaseOrder);
router.put('/:id/cancel', authorize('admin'), cancelPurchaseOrder);

export default router;
