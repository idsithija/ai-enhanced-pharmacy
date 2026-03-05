import { Router } from 'express';
import { processPrescriptionOCR, checkDrugInteractions, getMedicationInfo, predictAllDemand, predictSingleDemand, analyzePrescriptionText, chatbot } from '../controllers/aiController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/ocr/prescription', authenticate, authorize('admin', 'pharmacist'), processPrescriptionOCR);
router.post('/analyze-prescription', authenticate, authorize('admin', 'pharmacist'), analyzePrescriptionText);
router.post('/drug-interactions', authenticate, checkDrugInteractions);
router.get('/medication-info/:name', authenticate, getMedicationInfo);
router.get('/predict-demand', authenticate, authorize('admin', 'inventory_manager'), predictAllDemand);
router.get('/predict-demand/:medicineId', authenticate, authorize('admin', 'inventory_manager'), predictSingleDemand);
router.post('/chatbot', chatbot); // Public endpoint for customer assistance

export default router;
