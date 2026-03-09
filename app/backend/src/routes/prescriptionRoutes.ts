import { Router } from 'express';
import {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  verifyPrescription,
  rejectPrescription,
} from '../controllers/prescriptionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getPrescriptions);
router.get('/:id', getPrescription);
router.post('/', createPrescription);
router.put('/:id', authorize('admin', 'staff'), updatePrescription);
router.put('/:id/verify', authorize('admin', 'staff'), verifyPrescription);
router.put('/:id/reject', authorize('admin', 'staff'), rejectPrescription);

export default router;
