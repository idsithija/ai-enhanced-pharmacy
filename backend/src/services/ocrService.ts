import Tesseract from 'tesseract.js';
import natural from 'natural';

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
}

class OCRService {
  private tokenizer: any;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
  }

  /**
   * Process prescription image using Tesseract OCR
   */
  async processPrescription(imageSource: string): Promise<OCRResult> {
    try {
      console.log('Starting OCR processing...');

      // Perform OCR
      const result = await Tesseract.recognize(imageSource, 'eng', {
        logger: (m) => console.log(m),
      });

      const text = result.data.text;
      const confidence = result.data.confidence;

      console.log(`OCR completed with confidence: ${confidence}%`);

      // Extract structured data from text
      const extractedData = this.extractPrescriptionData(text);

      return {
        text,
        confidence,
        extractedData,
      };
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
