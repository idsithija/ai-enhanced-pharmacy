import { Router } from 'express';
import { processPrescriptionOCR, checkDrugInteractions, getMedicationInfo, predictDemand, analyzePrescriptionText, chatbot } from '../controllers/aiController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/ocr/prescription', authenticate, authorize('admin', 'pharmacist'), processPrescriptionOCR);
router.post('/analyze-prescription', authenticate, authorize('admin', 'pharmacist'), analyzePrescriptionText);
router.post('/drug-interactions', authenticate, checkDrugInteractions);
router.get('/medication-info/:name', authenticate, getMedicationInfo);
router.post('/predict-demand', authenticate, authorize('admin', 'inventory_manager'), predictDemand);
router.post('/chatbot', chatbot); // Public endpoint for customer assistance

export default router;
