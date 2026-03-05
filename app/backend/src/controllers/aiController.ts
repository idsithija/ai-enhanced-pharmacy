import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ocrService } from '../services/ocrService.js';
import { drugInteractionService } from '../services/drugInteractionService.js';
import { nlpService } from '../services/nlpService.js';
import { pharmacyChatbot } from '../services/chatbotService.js';
import { demandPredictionService } from '../services/demandPredictionService.js';

// @desc    Process prescription image with OCR
// @route   POST /api/ai/ocr/prescription
// @access  Private (pharmacist, admin)
export const processPrescriptionOCR = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { imageUrl, imageBase64 } = req.body;

    if (!imageUrl && !imageBase64) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide imageUrl or imageBase64' },
      });
      return;
    }

    const result = await ocrService.processPrescription(imageUrl || imageBase64);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Check drug interactions
// @route   POST /api/ai/drug-interactions
// @access  Private
export const checkDrugInteractions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { medications } = req.body;

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide an array of medications' },
      });
      return;
    }

    const interactions = await drugInteractionService.checkInteractions(medications);

    res.status(200).json({
      success: true,
      data: { interactions },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get medication information from OpenFDA
// @route   GET /api/ai/medication-info/:name
// @access  Private
export const getMedicationInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.params;

    if (!name) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide medication name' },
      });
      return;
    }

    const info = await drugInteractionService.getMedicationInfo(name);

    res.status(200).json({
      success: true,
      data: info,
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Predict demand for all medicines
// @route   GET /api/ai/predict-demand
// @access  Private (admin, inventory_manager)
export const predictAllDemand = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const summary = await demandPredictionService.predictAllDemand();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Predict demand for single medicine
// @route   GET /api/ai/predict-demand/:medicineId
// @access  Private (admin, inventory_manager)
export const predictSingleDemand = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { medicineId } = req.params;

    if (!medicineId) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide medicineId' },
      });
      return;
    }

    const prediction = await demandPredictionService.predictSingleMedicine(Number(medicineId));

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Analyze prescription text with NLP
// @route   POST /api/ai/analyze-prescription
// @access  Private (pharmacist, admin)
export const analyzePrescriptionText = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide prescription text' },
      });
      return;
    }

    const analysis = nlpService.analyzePrescription(text);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    AI Chatbot for customer assistance
// @route   POST /api/ai/chatbot
// @access  Public
export const chatbot = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide a message' },
      });
      return;
    }

    // Process message with enhanced chatbot service
    const result = pharmacyChatbot.processMessage(message);

    res.status(200).json({
      success: true,
      data: {
        message: result.response,
        suggestions: result.suggestions || [],
        category: result.category,
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    next(error);
  }
};
