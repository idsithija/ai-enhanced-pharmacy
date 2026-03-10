import natural from 'natural';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  private customModelPath: string;
  private ocrApiUrl: string;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.customModelPath = path.join(__dirname, '../../../ml-models/prescription-ocr/model');
    // Python OCR API endpoint - configurable via environment variable
    this.ocrApiUrl = process.env.OCR_API_URL || 'http://127.0.0.1:8000';
  }

  /**
   * Check if custom OCR API is available
   */
  private async checkCustomModelApi(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ocrApiUrl}/health`, { timeout: 5000 });
      
      if (response.data.status === 'healthy' && response.data.model_loaded) {
        console.log('✅ Custom OCR API is available:', this.ocrApiUrl);
        console.log('   Device:', response.data.device);
        return true;
      }
      
      console.warn('⚠️ OCR API responded but model not loaded');
      return false;
    } catch (error: any) {
      console.warn(`⚠️ Custom OCR API not available at ${this.ocrApiUrl}`);
      if (error.code === 'ECONNREFUSED') {
        console.warn('   Hint: Start the Python API service with: python ml-models/prescription-ocr/api_service.py');
      }
      return false;
    }
  }
  
  /**
   * Check if custom model files exist (for reference)
   */
  private checkCustomModelFiles(): boolean {
    // Check if model files exist (either pytorch_model.bin or model.safetensors)
    const modelExists = fs.existsSync(this.customModelPath);
    const configExists = fs.existsSync(path.join(this.customModelPath, 'config.json'));
    const pytorchModelExists = fs.existsSync(path.join(this.customModelPath, 'pytorch_model.bin'));
    const safetensorsExists = fs.existsSync(path.join(this.customModelPath, 'model.safetensors'));
    
    const filesExist = modelExists && configExists && (pytorchModelExists || safetensorsExists);
    
    if (filesExist) {
      console.log('✅ Custom TrOCR model files found at:', this.customModelPath);
    } else {
      console.error('❌ Model files not found at:', this.customModelPath);
      console.error('   Model directory exists:', modelExists);
      console.error('   Config exists:', configExists);
      console.error('   PyTorch model exists:', pytorchModelExists);
      console.error('   Safetensors model exists:', safetensorsExists);
    }
    
    return filesExist;
  }

  /**
   * Process prescription with custom TrOCR model via API
   */
  private async processWithCustomModel(imageSource: string): Promise<OCRResult> {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 Starting OCR Processing');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('API URL:', this.ocrApiUrl);
      console.log('Image Source Type:', 
        imageSource.startsWith('data:') ? 'Base64 Data URL' :
        imageSource.startsWith('http') ? 'HTTP URL' :
        'File Path or Base64'
      );
      console.log('Image Source Length:', imageSource.length, 'characters');
      console.log('Image Preview:', imageSource.substring(0, 100) + '...');
      console.log('⏱️  Starting request at:', new Date().toISOString());
      
      const startTime = Date.now();
      
      const response = await axios.post(
        `${this.ocrApiUrl}/process`,
        {
          imageSource: imageSource
        },
        {
          timeout: 180000, // 3 minute timeout for large images (increased from 60s)
          headers: {
            'Content-Type': 'application/json'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'OCR API returned failure');
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ OCR Processing Successful!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⏱️  Processing Time:', duration, 'seconds');
      console.log('📝 Extracted Text Length:', response.data.text?.length || 0, 'characters');
      console.log('💊 Medications Found:', response.data.extractedData?.medications?.length || 0);
      console.log('🖥️  Model Device:', response.data.device);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return {
        text: response.data.text,
        confidence: response.data.confidence,
        extractedData: response.data.extractedData,
        modelType: response.data.modelType
      };
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ OCR Processing Failed');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (error.response) {
        // API returned an error response
        console.error('📛 API Error Response:');
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        throw new Error(`OCR API error: ${error.response.data.detail || error.response.statusText}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.error('🔌 Connection Refused - OCR API not running');
        console.error('   API URL:', this.ocrApiUrl);
        throw new Error('OCR API service is not running. Please start it with: .\\start-ocr-api.ps1');
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        console.error('⏱️  Request Timeout');
        console.error('   The OCR API took longer than 3 minutes to respond');
        console.error('   This usually means:');
        console.error('   1. Image is very large - try resizing it');
        console.error('   2. Model is processing slowly on CPU - consider GPU');
        console.error('   3. API might be stuck - check the Python API logs');
        throw new Error('OCR API request timed out after 3 minutes. Try with a smaller image or check API logs.');
      } else {
        console.error('❓ Unknown Error:');
        console.error('   Code:', error.code);
        console.error('   Message:', error.message);
        throw error;
      }
    }
  }

  /**
   * Process prescription image - Uses PaddleOCR API
   */
  async processPrescription(imageSource: string): Promise<OCRResult> {
    console.log('Starting OCR processing with PaddleOCR API...');
    
    // Check if API is available
    const apiAvailable = await this.checkCustomModelApi();
    if (!apiAvailable) {
      throw new Error(
        'OCR API service is not running. Please start it with:\n' +
        'cd ml-models/prescription-ocr && python api_service.py'
      );
    }
    
    try {
      const result = await this.processWithCustomModel(imageSource);
      console.log('✅ PaddleOCR processing successful');
      return result;
    } catch (error: any) {
      console.error('❌ OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
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
