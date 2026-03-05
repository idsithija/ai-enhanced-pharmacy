import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addLoyaltyPoints,
  getCustomerStats,
} from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getCustomers);
router.get('/stats', getCustomerStats);
router.get('/phone/:phone', getCustomerByPhone);
router.get('/:id', getCustomer);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', authorize('admin'), deleteCustomer);
router.post('/:id/loyalty', addLoyaltyPoints);

export default router;
