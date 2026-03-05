import { Router } from 'express';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats,
} from '../controllers/supplierController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getSuppliers);
router.get('/stats', getSupplierStats);
router.get('/:id', getSupplier);
router.post('/', authorize('admin', 'inventory_manager'), createSupplier);
router.put('/:id', authorize('admin', 'inventory_manager'), updateSupplier);
router.delete('/:id', authorize('admin'), deleteSupplier);

export default router;
