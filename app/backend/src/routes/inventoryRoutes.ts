import { Router } from 'express';
import {
  getInventory,
  getInventoryItem,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  checkAvailability,
} from '../controllers/inventoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getInventory);
router.get('/alerts/low-stock', getLowStockItems);
router.post('/check', checkAvailability);
router.get('/:id', getInventoryItem);
router.post('/', authorize('admin', 'staff'), addInventoryItem);
router.put('/:id', authorize('admin', 'staff'), updateInventoryItem);
router.delete('/:id', authorize('admin'), deleteInventoryItem);

export default router;
