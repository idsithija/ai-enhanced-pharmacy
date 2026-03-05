import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5001/api/ai';

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface ExtractedData {
  patientName?: string;
  doctorName?: string;
  hospitalName?: string;
  medications: Medication[];
  date?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  extractedData: ExtractedData;
}

/**
 * Process prescription image using OCR
 */
export const processPrescriptionImage = async (imageFile: File): Promise<OCRResult> => {
  try {
    const token = useAuthStore.getState().token;
    
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const response = await axios.post(
      `${API_URL}/ocr/prescription`,
      { imageBase64: base64Image },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Error processing prescription:', error);
    throw error;
  }
};

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyze prescription text with NLP
 */
export const analyzePrescriptionText = async (text: string): Promise<ExtractedData> => {
  try {
    const token = useAuthStore.getState().token;
    
    const response = await axios.post(
      `${API_URL}/analyze-prescription`,
      { text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Error analyzing prescription:', error);
    throw error;
  }
};

/**
 * Get confidence level display
 */
export const getConfidenceDisplay = (confidence: number) => {
  if (confidence >= 80) {
    return { level: 'High', color: '#4caf50', severity: 'success' as const };
  } else if (confidence >= 60) {
    return { level: 'Medium', color: '#ff9800', severity: 'warning' as const };
  } else {
    return { level: 'Low', color: '#f44336', severity: 'error' as const };
  }
};

export const ocrService = {
  processPrescriptionImage,
  analyzePrescriptionText,
  getConfidenceDisplay,
};
