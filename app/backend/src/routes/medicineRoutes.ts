import { Router } from 'express';
import {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getMedicines);
router.get('/:id', getMedicine);
router.post('/', authorize('admin', 'pharmacist'), createMedicine);
router.put('/:id', authorize('admin', 'pharmacist'), updateMedicine);
router.delete('/:id', authorize('admin'), deleteMedicine);

export default router;
