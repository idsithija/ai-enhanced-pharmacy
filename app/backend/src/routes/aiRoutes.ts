import { Router } from 'express';
import { processPrescriptionOCR, checkDrugInteractions, getMedicationInfo, predictAllDemand, predictSingleDemand, analyzePrescriptionText, chatbot } from '../controllers/aiController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/ocr/prescription', authenticate, processPrescriptionOCR);
router.post('/analyze-prescription', authenticate, analyzePrescriptionText);
router.post('/drug-interactions', authenticate, checkDrugInteractions);
router.get('/medication-info/:name', authenticate, getMedicationInfo);
router.get('/predict-demand', authenticate, authorize('admin', 'staff'), predictAllDemand);
router.get('/predict-demand/:medicineId', authenticate, authorize('admin', 'staff'), predictSingleDemand);
router.post('/chatbot', chatbot); // Public endpoint for customer assistance

export default router;
