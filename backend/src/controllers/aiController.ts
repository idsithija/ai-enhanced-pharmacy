import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ocrService } from '../services/ocrService.js';
import { drugInteractionService } from '../services/drugInteractionService.js';
import { nlpService } from '../services/nlpService.js';

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

// @desc    Predict medicine demand using historical sales data
// @route   POST /api/ai/predict-demand
// @access  Private (admin, inventory_manager)
export const predictDemand = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { medicineId, days = 30 } = req.body;

    if (!medicineId) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide medicineId' },
      });
      return;
    }

    // Import models here to avoid circular dependencies
    const { Sale, Inventory, Medicine } = await import('../models/index.js');
    const { Op } = await import('sequelize');

    // Get historical sales data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sales: any = await Sale.findAll({
      where: {
        createdAt: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      attributes: ['items', 'createdAt'],
      order: [['createdAt', 'ASC']],
    } as any);

    // Extract quantities for specific medicine from sales items
    const dailySales: Record<string, number> = {};
    
    sales.forEach((sale: any) => {
      const items = sale.items || [];
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      
      items.forEach((item: any) => {
        if (item.medicineId === medicineId) {
          dailySales[date] = (dailySales[date] || 0) + (item.quantity || 0);
        }
      });
    });

    const salesData = Object.values(dailySales);

    if (salesData.length < 10) {
      res.status(200).json({
        success: true,
        data: {
          medicineId,
          error: 'Insufficient historical data (need at least 10 days)',
          recommendation: 'Please gather more sales history',
        },
      });
      return;
    }

    // Calculate moving average (simple prediction)
    const window = Math.min(7, salesData.length);
    const recentData = salesData.slice(-window);
    const movingAverage = recentData.reduce((sum, val) => sum + val, 0) / window;
    const predictedDemand = Math.ceil(movingAverage * Number(days));

    // Get current stock
    const inventory = await Inventory.sum('quantity', {
      where: {
        medicineId,
        expiryDate: {
          [Op.gt]: new Date(),
        },
      },
    } as any);

    const currentStock = inventory || 0;
    const daysOfStock = movingAverage > 0 ? Math.floor(currentStock / movingAverage) : 999;
    const shouldReorder = daysOfStock < 14;
    const reorderQuantity = shouldReorder ? Math.ceil(movingAverage * 30 - currentStock) : 0;

    // Get medicine details
    const medicine = await Medicine.findByPk(medicineId);

    res.status(200).json({
      success: true,
      data: {
        medicine: medicine ? { id: medicine.id, name: medicine.name } : null,
        prediction: {
          predictedDemand,
          period: `${days} days`,
          dailyAverage: movingAverage.toFixed(2),
          currentStock,
          daysOfStock,
          shouldReorder,
          reorderQuantity: Math.max(0, reorderQuantity),
          priority: daysOfStock < 7 ? 'critical' : daysOfStock < 14 ? 'high' : 'medium',
        },
        confidence: salesData.length >= 100 ? 'high' : salesData.length >= 50 ? 'medium' : 'low',
        dataPoints: salesData.length,
      },
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
    const { message, context } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide a message' },
      });
      return;
    }

    const userMessage = message.toLowerCase();

    // Simple rule-based chatbot (can be enhanced with NLP)
    let response = '';
    let suggestions: string[] = [];

    // Medicine inquiry
    if (userMessage.includes('medicine') || userMessage.includes('drug') || userMessage.includes('medication')) {
      if (userMessage.includes('available') || userMessage.includes('stock') || userMessage.includes('have')) {
        response = 'To check medicine availability, please use our search feature or provide the medicine name. Our staff can also help you find alternatives if a specific medicine is out of stock.';
        suggestions = ['Search medicines', 'Contact pharmacist', 'View alternatives'];
      } else if (userMessage.includes('price') || userMessage.includes('cost')) {
        response = 'Medicine prices vary based on brand and quantity. You can search for specific medicines to see their current prices, or contact our pharmacist for detailed pricing information.';
        suggestions = ['Search medicines', 'View price list', 'Contact us'];
      } else {
        response = 'I can help you with medicine information, availability, pricing, and general pharmacy services. What would you like to know?';
        suggestions = ['Check availability', 'Get pricing', 'Ask about side effects'];
      }
    }
    // Prescription related
    else if (userMessage.includes('prescription')) {
      response = 'For prescription services, you can upload your prescription image and our pharmacist will verify it. We accept both digital and physical prescriptions. Would you like to upload a prescription?';
      suggestions = ['Upload prescription', 'Prescription status', 'Contact pharmacist'];
    }
    // Store hours
    else if (userMessage.includes('hours') || userMessage.includes('open') || userMessage.includes('timing')) {
      response = 'Our pharmacy is open Monday to Saturday, 9:00 AM to 8:00 PM, and Sunday 10:00 AM to 6:00 PM. We\'re here to serve you!';
      suggestions = ['View location', 'Contact us', 'Emergency services'];
    }
    // Delivery
    else if (userMessage.includes('delivery') || userMessage.includes('shipping')) {
      response = 'Yes, we offer home delivery services! Delivery is free for orders above $50. Typical delivery time is 2-4 hours for local areas. Would you like to place an order?';
      suggestions = ['Check delivery area', 'Place order', 'Track order'];
    }
    // Side effects
    else if (userMessage.includes('side effect') || userMessage.includes('adverse')) {
      response = 'For medicine side effects and interactions, I recommend consulting with our pharmacist. You can also check the drug interaction checker or contact us for detailed information.';
      suggestions = ['Check drug interactions', 'Contact pharmacist', 'Emergency services'];
    }
    // Contact
    else if (userMessage.includes('contact') || userMessage.includes('phone') || userMessage.includes('call')) {
      response = 'You can reach us at: Phone: (123) 456-7890, Email: pharmacy@example.com. Our pharmacist is also available for online consultations during business hours.';
      suggestions = ['Call now', 'Send email', 'Chat with pharmacist'];
    }
    // Default
    else {
      response = 'Hello! I\'m here to help you with medicine inquiries, prescriptions, store information, and pharmacy services. How can I assist you today?';
      suggestions = ['Medicine availability', 'Upload prescription', 'Store hours', 'Contact us'];
    }

    res.status(200).json({
      success: true,
      data: {
        message: response,
        suggestions,
        context: context || 'general',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    next(error);
  }
};
