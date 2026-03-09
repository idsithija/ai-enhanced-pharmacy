"""
Custom TrOCR Model API Service — Line-Level Pipeline
=====================================================
Pipeline: Full Image → Line Detection → TrOCR per line → Smart Parser
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
import numpy as np

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
    """Load image from various sources"""
    try:
        if image_input.startswith('data:image'):
            image_data = image_input.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        elif image_input.startswith('http://') or image_input.startswith('https://'):
            import requests
            response = requests.get(image_input, timeout=30)
            response.raise_for_status()
            image_bytes = response.content
        elif ':\\' in image_input or image_input.startswith('/'):
            with open(image_input, 'rb') as f:
                image_bytes = f.read()
        else:
            image_bytes = base64.b64decode(image_input)

        image = Image.open(BytesIO(image_bytes)).convert('RGB')

        # Resize very large images to prevent memory issues
        max_dimension = 2048
        if image.width > max_dimension or image.height > max_dimension:
            ratio = min(max_dimension / image.width, max_dimension / image.height)
            new_size = (int(image.width * ratio), int(image.height * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)

        return image
    except Exception as e:
        raise ValueError(f"Failed to load image: {str(e)}")


# ==================== LINE DETECTION ====================

def _projection_lines(binary, image: Image.Image, threshold_pct: float):
    """Extract line crops using horizontal projection profile."""
    h_proj = np.sum(binary, axis=1)
    if np.max(h_proj) == 0:
        return []
    threshold = max(200, np.max(h_proj) * threshold_pct)
    text_rows = h_proj > threshold
    lines = []
    in_line = False
    start = 0
    for i in range(len(text_rows)):
        if text_rows[i] and not in_line:
            start = i
            in_line = True
        elif not text_rows[i] and in_line:
            if i - start >= 8:
                lines.append((start, i))
            in_line = False
    if in_line and len(text_rows) - start >= 8:
        lines.append((start, len(text_rows)))
    pad = 6
    crops = []
    for s, e in lines:
        y1 = max(0, s - pad)
        y2 = min(image.height, e + pad)
        crops.append(image.crop((0, y1, image.width, y2)))
    return crops


def _contour_lines(binary, image: Image.Image):
    """Extract line crops using contour detection with horizontal dilation."""
    import cv2

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (image.width // 4, 5))
    dilated = cv2.dilate(binary, kernel, iterations=1)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    min_width = image.width * 0.05
    boxes = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w >= min_width and 10 <= h <= image.height * 0.3:
            boxes.append((x, y, w, h))
    boxes.sort(key=lambda b: b[1])

    # Merge vertically overlapping boxes
    merged = []
    for box in boxes:
        x, y, w, h = box
        if merged:
            px, py, pw, ph = merged[-1]
            overlap = min(py + ph, y + h) - max(py, y)
            if overlap > 0.5 * min(ph, h):
                nx = min(px, x)
                ny = min(py, y)
                nw = max(px + pw, x + w) - nx
                nh = max(py + ph, y + h) - ny
                merged[-1] = (nx, ny, nw, nh)
                continue
        merged.append(box)

    padding = 8
    crops = []
    for x, y, w, h in merged:
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(image.width, x + w + padding)
        y2 = min(image.height, y + h + padding)
        crops.append(image.crop((x1, y1, x2, y2)))
    return crops


def detect_text_lines(image: Image.Image):
    """
    Detect individual text lines using multiple strategies.
    Tries contour-based, projection with morph-open, and projection with
    fixed threshold, then picks the method that finds the most lines in a
    reasonable range (5-30).
    """
    import cv2

    img_array = np.array(image)
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    results = []

    # Method 1: Contour-based (works well for clean / high-quality images)
    lines_contour = _contour_lines(binary, image)
    results.append(("contour", lines_contour))

    # Method 2: Projection profile with morph-open cleaning + 5 % threshold
    kernel_clean = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_clean)
    lines_proj = _projection_lines(cleaned, image, 0.05)
    results.append(("projection", lines_proj))

    # Method 3: Low fixed-threshold binarization + projection (fallback)
    _, binary_fixed = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
    lines_fixed = _projection_lines(binary_fixed, image, 0.02)
    results.append(("fixed_thresh", lines_fixed))

    # Pick the method with the most lines in the reasonable range [5, 30]
    best = max(results, key=lambda r: len(r[1]) if 5 <= len(r[1]) <= 30 else 0)
    if len(best[1]) < 5:
        best = max(results, key=lambda r: len(r[1]))

    logger.info(f"Detected {len(best[1])} text lines (method: {best[0]})")
    return best[1]


# ==================== OCR PER LINE ====================

def ocr_single_line(line_image: Image.Image) -> str:
    """Run TrOCR on a single line image"""
    import torch

    pixel_values = processor(line_image, return_tensors="pt").pixel_values.to(device)

    with torch.no_grad():
        generated_ids = model.generate(
            pixel_values,
            max_length=64,
            num_beams=4,
            early_stopping=True,
        )

    text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return text.strip()


def ocr_full_image(image: Image.Image) -> str:
    """Full pipeline: detect lines → OCR each line → combine"""
    line_images = detect_text_lines(image)

    if not line_images:
        logger.warning("No text lines detected, falling back to full-image OCR")
        return ocr_single_line(image)

    lines = []
    for i, line_img in enumerate(line_images):
        text = ocr_single_line(line_img)
        if text:
            lines.append(text)
            logger.info(f"  Line {i+1}: {text[:80]}")

    return "\n".join(lines)

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
    """Process prescription image using line-detection pipeline"""

    if model is None or processor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    import time
    start_time = time.time()

    try:
        logger.info("=" * 60)
        logger.info("New OCR Request Received (Line Pipeline)")
        logger.info("=" * 60)

        # Load image
        t1 = time.time()
        image = load_image(request.imageSource)
        load_time = time.time() - t1
        logger.info(f"Image loaded: {image.size} ({load_time:.2f}s)")

        # Line-level OCR pipeline
        t2 = time.time()
        predicted_text = ocr_full_image(image)
        ocr_time = time.time() - t2
        logger.info(f"OCR completed: {len(predicted_text)} chars ({ocr_time:.2f}s)")

        # Parse structured data
        t3 = time.time()
        extracted_data = parse_prescription_text(predicted_text)
        parse_time = time.time() - t3

        total_time = time.time() - start_time

        logger.info("=" * 60)
        logger.info("Performance Breakdown:")
        logger.info(f"   Image Loading:    {load_time:.2f}s")
        logger.info(f"   Line OCR:         {ocr_time:.2f}s")
        logger.info(f"   Data Parsing:     {parse_time:.2f}s")
        logger.info(f"   TOTAL:            {total_time:.2f}s")
        logger.info(f"Medications found: {len(extracted_data.get('medications', []))}")
        logger.info("=" * 60)

        return OCRResponse(
            success=True,
            text=predicted_text,
            confidence=0.90,
            extractedData=extracted_data,
            modelType="custom-trocr-line-pipeline",
            device=device,
        )

    except ValueError as e:
        logger.error(f"Image loading error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Processing error: {e}")
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
