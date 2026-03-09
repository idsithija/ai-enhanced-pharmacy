"""
Custom TrOCR Model API Service
FastAPI service that exposes the custom TrOCR model via HTTP endpoints.
Run this service independently and call it from the Node.js backend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import uvicorn
import base64
from pathlib import Path
from io import BytesIO
from PIL import Image
import re
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model configuration
MODEL_DIR = Path(__file__).parent / "model"
model = None
processor = None
device = None

class OCRRequest(BaseModel):
    imageSource: str  # Base64 string, data URL, file path, or HTTP URL
    
class OCRResponse(BaseModel):
    success: bool
    text: str = ""
    confidence: float = 0.0
    extractedData: dict = {}
    modelType: str = "custom-trocr"
    device: str = ""
    error: str = ""

def load_model():
    """Load the TrOCR model on startup"""
    global model, processor, device
    
    try:
        logger.info("Loading TrOCR model...")
        
        # Check if model exists
        if not MODEL_DIR.exists():
            raise FileNotFoundError(f"Model directory not found: {MODEL_DIR}")
        
        # Import ML libraries
        import torch
        from transformers import TrOCRProcessor, VisionEncoderDecoderModel
        
        # Load model and processor
        processor = TrOCRProcessor.from_pretrained(str(MODEL_DIR))
        model = VisionEncoderDecoderModel.from_pretrained(str(MODEL_DIR))
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model.to(device)
        model.eval()
        
        logger.info(f"✅ Model loaded successfully on {device}")
        logger.info(f"Model path: {MODEL_DIR}")
        
    except ImportError as e:
        logger.error(f"Missing dependencies: {e}")
        logger.error("Please install: pip install torch transformers")
        raise
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, cleanup on shutdown"""
    # Startup
    load_model()
    yield
    # Shutdown (cleanup if needed)
    logger.info("Shutting down OCR API service...")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Prescription OCR API",
    description="Custom TrOCR model for prescription image processing",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your backend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_image(image_input: str) -> Image.Image:
    """Load image from various sources and preprocess"""
    try:
        if image_input.startswith('data:image'):
            # Base64 data URL
            image_data = image_input.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        elif image_input.startswith('http://') or image_input.startswith('https://'):
            # HTTP URL
            import requests
            response = requests.get(image_input, timeout=30)
            response.raise_for_status()
            image_bytes = response.content
        elif ':\\' in image_input or image_input.startswith('/'):
            # File path
            with open(image_input, 'rb') as f:
                image_bytes = f.read()
        else:
            # Plain base64 string
            image_bytes = base64.b64decode(image_input)
        
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        
        # Optimize: Resize large images for faster processing
        # TrOCR works best with images around 384px height
        max_dimension = 2048  # Maximum dimension to prevent memory issues
        if image.width > max_dimension or image.height > max_dimension:
            logger.info(f"Resizing large image from {image.size}")
            # Calculate new size maintaining aspect ratio
            ratio = min(max_dimension / image.width, max_dimension / image.height)
            new_size = (int(image.width * ratio), int(image.height * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
            logger.info(f"Resized to {image.size}")
        
        return image
    except Exception as e:
        raise ValueError(f"Failed to load image: {str(e)}")

def parse_prescription_text(text: str) -> dict:
    """Parse prescription text to extract structured information"""
    lines = text.split('\n')
    data = {
        "medications": []
    }
    
    # Extract patient name (fixed: capture after "Patient Name:")
    patient_match = re.search(r'Patient\s+Name[:\s]+([A-Za-z\.\s]+?)(?:\n|$)', text, re.IGNORECASE)
    if patient_match:
        data['patientName'] = patient_match.group(1).strip()
    
    # Extract doctor name (fixed: capture after "Doctor:")
    doctor_match = re.search(r'Doctor[:\s]+([A-Za-z\.\s]+?)(?:\n|$)', text, re.IGNORECASE)
    if doctor_match:
        data['doctorName'] = doctor_match.group(1).strip()
    
    # Extract hospital (usually first line)
    hospital_match = re.search(r'^([A-Za-z\s]+(?:Hospital|Clinic|Medical Center))', text, re.IGNORECASE | re.MULTILINE)
    if hospital_match:
        data['hospitalName'] = hospital_match.group(1).strip()
    
    # Extract date
    date_match = re.search(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b', text)
    if date_match:
        data['date'] = date_match.group(1)
    
    # Extract medications (improved to handle structured format)
    # Pattern: "1. Medicine dosage form" - supports mg, ml, g, mcg, IU
    med_pattern = r'^\s*\d+\.\s+(.+?)\s+(\d+\s*(?:mg|ml|g|mcg|IU))\s+(Tab|Cap|Syrup|Injection|Tablet|Capsule)'
    
    i = 0
    while i < len(lines):
        line = lines[i]
        med_match = re.search(med_pattern, line, re.IGNORECASE)
        
        if med_match:
            med_name = med_match.group(1).strip()
            dosage = med_match.group(2).strip()
            form = med_match.group(3).strip()
            
            # Look ahead for frequency and duration
            frequency = None
            duration = None
            
            # Check next 5 lines for frequency/duration
            for j in range(i+1, min(i+6, len(lines))):
                next_line = lines[j].strip()
                
                # Skip empty lines
                if not next_line:
                    continue
                
                # Stop if we hit the next medication
                if re.match(r'^\d+\.', next_line):
                    break
                
                # Extract frequency (1-0-1, once daily, twice daily, as needed, etc.)
                if not frequency:
                    freq_match = re.search(r'((?:\d+-\d+-\d+|once|twice|thrice|three times|as needed)(?:\s*\([^)]+\))?)', next_line, re.IGNORECASE)
                    if freq_match:
                        frequency = freq_match.group(1).strip()
                
                # Extract duration (with or without "Duration:" prefix)
                if not duration:
                    # Try with "Duration:" prefix first
                    dur_match = re.search(r'Duration:\s*(\d+\s*(?:day|week|month)s?)', next_line, re.IGNORECASE)
                    if dur_match:
                        duration = dur_match.group(1).strip()
                    else:
                        # Try standalone duration pattern
                        dur_match = re.search(r'^\s*(\d+\s*(?:day|week|month)s?)$', next_line, re.IGNORECASE)
                        if dur_match:
                            duration = dur_match.group(1).strip()
            
            data['medications'].append({
                'name': f"{med_name} {dosage} {form}",
                'dosage': dosage,
                'frequency': frequency,
                'duration': duration
            })
        
        i += 1
    
    return data

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Prescription OCR API",
        "status": "running",
        "model_loaded": model is not None,
        "device": device
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "device": device,
        "model_path": str(MODEL_DIR)
    }

@app.post("/process", response_model=OCRResponse)
async def process_prescription(request: OCRRequest):
    """Process prescription image with OCR"""
    
    if model is None or processor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    import time
    start_time = time.time()
    
    try:
        logger.info("=" * 60)
        logger.info("📸 New OCR Request Received")
        logger.info("=" * 60)
        
        # Load and process image
        t1 = time.time()
        image = load_image(request.imageSource)
        load_time = time.time() - t1
        logger.info(f"✅ Image loaded: {image.size} (took {load_time:.2f}s)")
        
        # Import torch for inference
        import torch
        
        # Preprocess image
        t2 = time.time()
        pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)
        preprocess_time = time.time() - t2
        logger.info(f"✅ Image preprocessed (took {preprocess_time:.2f}s)")
        
        # Generate prediction with proper parameters
        t3 = time.time()
        with torch.no_grad():
            generated_ids = model.generate(
                pixel_values,
                max_length=512,           # Allow full prescription text
                num_beams=4,              # Beam search for better quality
                early_stopping=True,      # Stop when done
                no_repeat_ngram_size=3,   # Prevent repetition
                temperature=1.0,          # Diversity
                do_sample=False           # Deterministic beam search
            )
        inference_time = time.time() - t3
        logger.info(f"✅ Model inference completed (took {inference_time:.2f}s)")
        
        # Decode text
        t4 = time.time()
        predicted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        decode_time = time.time() - t4
        logger.info(f"✅ Text decoded: {len(predicted_text)} chars (took {decode_time:.2f}s)")
        
        # Extract structured data
        t5 = time.time()
        extracted_data = parse_prescription_text(predicted_text)
        parse_time = time.time() - t5
        
        total_time = time.time() - start_time
        
        logger.info("=" * 60)
        logger.info("⏱️  Performance Breakdown:")
        logger.info(f"   Image Loading:    {load_time:.2f}s")
        logger.info(f"   Preprocessing:    {preprocess_time:.2f}s")
        logger.info(f"   Model Inference:  {inference_time:.2f}s")
        logger.info(f"   Text Decoding:    {decode_time:.2f}s")
        logger.info(f"   Data Parsing:     {parse_time:.2f}s")
        logger.info(f"   TOTAL:            {total_time:.2f}s")
        logger.info("=" * 60)
        logger.info(f"📊 Results: {len(extracted_data.get('medications', []))} medications found")
        logger.info("=" * 60)
        
        return OCRResponse(
            success=True,
            text=predicted_text,
            confidence=0.90,  # TrOCR doesn't provide confidence scores
            extractedData=extracted_data,
            modelType="custom-trocr",
            device=device
        )
        
    except ValueError as e:
        logger.error(f"❌ Image loading error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Processing error: {e}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

if __name__ == "__main__":
    # Run the API service
    uvicorn.run(
        app,
        host="127.0.0.1",  # localhost only for security
        port=8000,  # You can change this port
        log_level="info"
    )
