import Tesseract from 'tesseract.js';
import natural from 'natural';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface OCRResult {
  text: string;
  confidence: number;
  extractedData: {
    patientName?: string;
    doctorName?: string;
    hospitalName?: string;
    medications: Array<{
      name: string;
      dosage?: string;
      frequency?: string;
      duration?: string;
    }>;
    date?: string;
  };
  modelType?: string;
}

class OCRService {
  private tokenizer: any;
  private customModelAvailable: boolean | null = null;
  private customModelPath: string;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.customModelPath = path.join(__dirname, '../../../ml-models/prescription-ocr/model');
  }

  /**
   * Check if custom model is available
   */
  private checkCustomModel(): boolean {
    if (this.customModelAvailable !== null) {
      return this.customModelAvailable;
    }

    try {
      // Check if model directory exists and has required files
      const modelExists = fs.existsSync(this.customModelPath);
      const configExists = fs.existsSync(path.join(this.customModelPath, 'config.json'));
      const modelFileExists = fs.existsSync(path.join(this.customModelPath, 'pytorch_model.bin'));

      this.customModelAvailable = modelExists && configExists && modelFileExists;
      
      if (this.customModelAvailable) {
        console.log('✅ Custom TrOCR model detected and available');
      } else {
        console.log('ℹ️  Custom model not found. Using Tesseract fallback.');
      }

      return this.customModelAvailable;
    } catch (error) {
      console.error('Error checking custom model:', error);
      this.customModelAvailable = false;
      return false;
    }
  }

  /**
   * Process prescription with custom TrOCR model
   */
  private async processWithCustomModel(imageSource: string): Promise<OCRResult> {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '../services/customOcrModel.py');
      
      // Spawn Python process
      const pythonProcess = spawn('python', [pythonScript, imageSource]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Custom model error:', stderr);
          reject(new Error('Custom model processing failed'));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          
          if (!result.success) {
            reject(new Error(result.error || 'Custom model failed'));
            return;
          }

          resolve({
            text: result.text,
            confidence: result.confidence,
            extractedData: result.extractedData,
            modelType: 'custom-trocr'
          });
        } catch (error) {
          console.error('Error parsing custom model output:', error);
          reject(new Error('Failed to parse custom model output'));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to spawn Python process:', error);
        reject(error);
      });
    });
  }

  /**
   * Process prescription image using Tesseract OCR (fallback)
   */
  private async processWithTesseract(imageSource: string): Promise<OCRResult> {
    console.log('Using Tesseract OCR...');

    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: (m) => console.log(m),
    });

    const text = result.data.text;
    const confidence = result.data.confidence;

    console.log(`Tesseract OCR completed with confidence: ${confidence}%`);

    // Extract structured data from text
    const extractedData = this.extractPrescriptionData(text);

    return {
      text,
      confidence,
      extractedData,
      modelType: 'tesseract'
    };
  }

  /**
   * Process prescription image - tries custom model first, falls back to Tesseract
   */
  async processPrescription(imageSource: string): Promise<OCRResult> {
    try {
      console.log('Starting OCR processing...');

      // Try custom model first if available
      if (this.checkCustomModel()) {
        try {
          console.log('Attempting to use custom TrOCR model...');
          const result = await this.processWithCustomModel(imageSource);
          console.log('✅ Custom model processing successful');
          return result;
        } catch (error) {
          console.warn('Custom model failed, falling back to Tesseract:', error);
          // Fall through to Tesseract
        }
      }

      // Use Tesseract as fallback
      return await this.processWithTesseract(imageSource);

    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('Failed to process prescription image');
    }
  }

  /**
   * Extract structured data from OCR text using NLP
   */
  private extractPrescriptionData(text: string): OCRResult['extractedData'] {
    const lines = text.split('\n').filter((line) => line.trim().length > 0);

    const extractedData: OCRResult['extractedData'] = {
      medications: [],
    };

    // Common patterns
    const patientPattern = /patient[:\s]+([a-z\s]+)/i;
    const doctorPattern = /(?:dr\.|doctor)[:\s]+([a-z\s]+)/i;
    const hospitalPattern = /hospital[:\s]+([a-z\s]+)/i;
    const datePattern = /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/;

    // Extract patient name
    const patientMatch = text.match(patientPattern);
    if (patientMatch) {
      extractedData.patientName = patientMatch[1].trim();
    }

    // Extract doctor name
    const doctorMatch = text.match(doctorPattern);
    if (doctorMatch) {
      extractedData.doctorName = doctorMatch[1].trim();
    }

    // Extract hospital name
    const hospitalMatch = text.match(hospitalPattern);
    if (hospitalMatch) {
      extractedData.hospitalName = hospitalMatch[1].trim();
    }

    // Extract date
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      extractedData.date = dateMatch[1];
    }

    // Extract medications (simplified logic)
    // Look for lines that might contain medication names
    const medicationKeywords = ['tab', 'tablet', 'capsule', 'cap', 'syrup', 'injection', 'mg', 'ml'];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const hasMedicationKeyword = medicationKeywords.some((keyword) => lowerLine.includes(keyword));

      if (hasMedicationKeyword) {
        // Extract dosage patterns (e.g., 500mg, 10ml)
        const dosageMatch = line.match(/(\d+\s*(?:mg|ml|g|mcg))/i);
        
        // Extract frequency patterns (e.g., twice daily, 1-0-1)
        const frequencyMatch = line.match(/(?:once|twice|thrice|[\d-]+)\s*(?:daily|a day|per day)?/i);
        
        // Extract duration (e.g., 7 days, 2 weeks)
        const durationMatch = line.match(/(\d+\s*(?:days?|weeks?|months?))/i);

        extractedData.medications.push({
          name: line.trim(),
          dosage: dosageMatch ? dosageMatch[1] : undefined,
          frequency: frequencyMatch ? frequencyMatch[0] : undefined,
          duration: durationMatch ? durationMatch[1] : undefined,
        });
      }
    }

    return extractedData;
  }

  /**
   * Analyze text quality and suggest improvements
   */
  analyzeTextQuality(text: string): {
    quality: 'good' | 'fair' | 'poor';
    suggestions: string[];
  } {
    const wordCount = this.tokenizer.tokenize(text).length;
    const suggestions: string[] = [];

    let quality: 'good' | 'fair' | 'poor' = 'good';

    if (wordCount < 10) {
      quality = 'poor';
      suggestions.push('Very few words detected. Image might be blurry or low quality.');
    } else if (wordCount < 30) {
      quality = 'fair';
      suggestions.push('Limited text detected. Consider using a higher resolution image.');
    }

    // Check for common OCR issues
    if (text.includes('???') || text.includes('###')) {
      quality = 'poor';
      suggestions.push('Unrecognizable characters detected. Please provide a clearer image.');
    }

    return { quality, suggestions };
  }
}

export const ocrService = new OCRService();
export default ocrService;
