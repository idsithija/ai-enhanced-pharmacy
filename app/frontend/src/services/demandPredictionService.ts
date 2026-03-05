import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5001/api/ai';

export interface PredictionResult {
  medicineId: number;
  medicineName: string;
  currentStock: number;
  averageDailySales: number;
  predictedDemand: number; // Next 7 days
  predictedDemand30Days: number;
  daysUntilStockout: number;
  recommendedReorderQuantity: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
  seasonalityFactor: number;
}

export interface DemandSummary {
  predictions: PredictionResult[];
  criticalStockItems: PredictionResult[];
  highDemandItems: PredictionResult[];
  slowMovingItems: PredictionResult[];
}

/**
 * Get demand predictions for all medicines
 */
export const getAllPredictions = async (): Promise<DemandSummary> => {
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.get(`${API_URL}/predict-demand`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching demand predictions:', error);
    throw error;
  }
};

/**
 * Get demand prediction for a specific medicine
 */
export const getSinglePrediction = async (medicineId: number): Promise<PredictionResult> => {
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.get(`${API_URL}/predict-demand/${medicineId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching single medicine prediction:', error);
    throw error;
  }
};

/**
 * Get trend icon and color based on trend direction
 */
export const getTrendDisplay = (trend: 'increasing' | 'stable' | 'decreasing') => {
  switch (trend) {
    case 'increasing':
      return { icon: '📈', color: '#4caf50', label: 'Increasing' };
    case 'decreasing':
      return { icon: '📉', color: '#f44336', label: 'Decreasing' };
    default:
      return { icon: '➡️', color: '#2196f3', label: 'Stable' };
  }
};

/**
 * Get priority level based on days until stockout
 */
export const getPriorityLevel = (daysUntilStockout: number) => {
  if (daysUntilStockout < 7) {
    return { level: 'Critical', color: '#f44336', severity: 'error' };
  } else if (daysUntilStockout < 14) {
    return { level: 'High', color: '#ff9800', severity: 'warning' };
  } else if (daysUntilStockout < 30) {
    return { level: 'Medium', color: '#2196f3', severity: 'info' };
  } else {
    return { level: 'Low', color: '#4caf50', severity: 'success' };
  }
};

export const demandPredictionService = {
  getAllPredictions,
  getSinglePrediction,
  getTrendDisplay,
  getPriorityLevel,
};
