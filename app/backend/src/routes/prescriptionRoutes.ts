import { Router } from 'express';
import {
  getPrescriptions,
  getMyPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  verifyPrescription,
  rejectPrescription,
  dispensePrescription,
  uploadPrescription,
  upload,
} from '../controllers/prescriptionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload must be before /:id to avoid matching 'upload' as an id
router.post('/upload', upload.single('image'), uploadPrescription);

router.get('/my', getMyPrescriptions);
router.get('/', getPrescriptions);
router.get('/:id', getPrescription);
router.post('/', createPrescription);
router.put('/:id', authorize('admin', 'staff'), updatePrescription);
router.put('/:id/verify', authorize('admin', 'staff'), verifyPrescription);
router.put('/:id/reject', authorize('admin', 'staff'), rejectPrescription);
router.put('/:id/dispense', authorize('admin', 'staff'), dispensePrescription);

export default router;
