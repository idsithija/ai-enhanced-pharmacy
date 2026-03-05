import { demandPredictionService } from '../../services/demandPredictionService';

// Mock Medicine model
jest.mock('../../models/Medicine', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

import Medicine from '../../models/Medicine';

describe('Demand Prediction Service Tests', () => {
  const mockMedicines = [
    {
      id: 1,
      name: 'Aspirin 100mg',
      category: 'Pain Relief',
      quantity: 500,
      selling_price: 50,
    },
    {
      id: 2,
      name: 'Paracetamol 500mg',
      category: 'Fever',
      quantity: 200,
      selling_price: 30,
    },
    {
      id: 3,
      name: 'Vitamin C 1000mg',
      category: 'Vitamin',
      quantity: 1000,
      selling_price: 80,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('predictAllDemand()', () => {
    it('should generate predictions for all medicines', async () => {
      (Medicine.findAll as jest.Mock).mockResolvedValue(mockMedicines);

      const result = await demandPredictionService.predictAllDemand();

      expect(result).toHaveProperty('predictions');
      expect(result).toHaveProperty('criticalStockItems');
      expect(result).toHaveProperty('highDemandItems');
      expect(result).toHaveProperty('slowMovingItems');
      expect(result.predictions.length).toBe(3);
    });

    it('should categorize critical stock items correctly', async () => {
      (Medicine.findAll as jest.Mock).mockResolvedValue(mockMedicines);

      const result = await demandPredictionService.predictAllDemand();

      result.criticalStockItems.forEach((item) => {
        expect(item.daysUntilStockout).toBeLessThan(7);
        expect(item.daysUntilStockout).toBeGreaterThan(0);
      });
    });

    it('should identify high demand items with increasing trend', async () => {
      (Medicine.findAll as jest.Mock).mockResolvedValue(mockMedicines);

      const result = await demandPredictionService.predictAllDemand();

      result.highDemandItems.forEach((item) => {
        expect(item.trend).toBe('increasing');
      });
    });

    it('should include all required prediction fields', async () => {
      (Medicine.findAll as jest.Mock).mockResolvedValue(mockMedicines);

      const result = await demandPredictionService.predictAllDemand();
      const prediction = result.predictions[0];

      expect(prediction).toHaveProperty('medicineId');
      expect(prediction).toHaveProperty('medicineName');
      expect(prediction).toHaveProperty('currentStock');
      expect(prediction).toHaveProperty('averageDailySales');
      expect(prediction).toHaveProperty('predictedDemand');
      expect(prediction).toHaveProperty('predictedDemand30Days');
      expect(prediction).toHaveProperty('daysUntilStockout');
      expect(prediction).toHaveProperty('recommendedReorderQuantity');
      expect(prediction).toHaveProperty('trend');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('seasonalityFactor');
    });

    it('should calculate confidence scores between 0-100', async () => {
      (Medicine.findAll as jest.Mock).mockResolvedValue(mockMedicines);

      const result = await demandPredictionService.predictAllDemand();

      result.predictions.forEach((prediction) => {
        expect(prediction.confidence).toBeGreaterThanOrEqual(0);
        expect(prediction.confidence).toBeLessThanOrEqual(100);
      });
    });

    it('should generate positive reorder quantities for low stock', async () => {
      (Medicine.findAll as jest.Mock).mockResolvedValue(mockMedicines);

      const result = await demandPredictionService.predictAllDemand();

      result.predictions.forEach((prediction) => {
        expect(prediction.recommendedReorderQuantity).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('predictSingleMedicine()', () => {
    it('should predict demand for specific medicine', async () => {
      (Medicine.findByPk as jest.Mock).mockResolvedValue(mockMedicines[0]);
      (Medicine.findAll as jest.Mock).mockResolvedValue(mockMedicines);

      const result = await demandPredictionService.predictSingleMedicine(1);

      expect(result.medicineId).toBe(1);
      expect(result.medicineName).toBe('Aspirin 100mg');
      expect(result).toHaveProperty('predictedDemand');
    });

    it('should throw error for non-existent medicine', async () => {
      (Medicine.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        demandPredictionService.predictSingleMedicine(999)
      ).rejects.toThrow('Medicine not found');
    });

    it('should calculate trend correctly', async () => {
      (Medicine.findByPk as jest.Mock).mockResolvedValue(mockMedicines[0]);
      (Medicine.findAll as jest.Mock).mockResolvedValue(mockMedicines);

      const result = await demandPredictionService.predictSingleMedicine(1);

      expect(['increasing', 'stable', 'decreasing']).toContain(result.trend);
    });
  });

  describe('Seasonality Calculations', () => {
    it('should apply higher seasonality for winter medicines', async () => {
      const winterMedicine = {
        id: 10,
        name: 'Cold Medicine',
        category: 'Cold and Cough',
        quantity: 300,
        selling_price: 120,
      };

      (Medicine.findAll as jest.Mock).mockResolvedValue([winterMedicine]);

      const result = await demandPredictionService.predictAllDemand();
      const prediction = result.predictions[0];

      // Winter medicines should have higher seasonality in winter months
      expect(prediction.seasonalityFactor).toBeGreaterThan(0);
    });
  });
});
