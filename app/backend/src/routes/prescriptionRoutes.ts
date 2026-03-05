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
router.post('/', authorize('admin', 'pharmacist'), createPrescription);
router.put('/:id', authorize('admin', 'pharmacist'), updatePrescription);
router.put('/:id/verify', authorize('admin', 'pharmacist'), verifyPrescription);
router.put('/:id/reject', authorize('admin', 'pharmacist'), rejectPrescription);

export default router;
