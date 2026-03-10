"""
Prescription OCR API Service — PaddleOCR Pipeline
==================================================
Uses PaddleOCR for full-page text detection + recognition.
Supports both pretrained and custom-trained recognition models.
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

# PaddleOCR engine (initialized on startup)
ocr_engine = None
MODEL_TYPE = "paddleocr-pretrained"  # updated if custom model loaded

class OCRRequest(BaseModel):
    imageSource: str  # Base64 string, data URL, file path, or HTTP URL

class OCRResponse(BaseModel):
    success: bool
    text: str = ""
    confidence: float = 0.0
    extractedData: dict = {}
    modelType: str = "paddleocr"
    device: str = ""
    error: str = ""


def load_model():
    """Initialize PaddleOCR engine on startup.
    Loads custom-trained det and/or rec models if available, otherwise pretrained."""
    global ocr_engine, MODEL_TYPE

    try:
        logger.info("Initializing PaddleOCR engine...")
        from paddleocr import PaddleOCR

        # Check for custom-trained models
        custom_det_dir = Path(__file__).parent / "model" / "det_inference"
        custom_rec_dir = Path(__file__).parent / "model" / "inference"
        custom_dict = Path(__file__).parent / "training_data" / "en_dict.txt"

        kwargs = {
            'use_angle_cls': True,
            'lang': 'en',
            'show_log': False,
        }

        has_det = custom_det_dir.exists() and any(custom_det_dir.glob("*.pdmodel"))
        has_rec = custom_rec_dir.exists() and any(custom_rec_dir.glob("*.pdmodel"))

        if has_det:
            logger.info(f"Loading CUSTOM det model from {custom_det_dir}")
            kwargs['det_model_dir'] = str(custom_det_dir)

        if has_rec:
            logger.info(f"Loading CUSTOM rec model from {custom_rec_dir}")
            kwargs['rec_model_dir'] = str(custom_rec_dir)
            if custom_dict.exists():
                kwargs['rec_char_dict_path'] = str(custom_dict)

        if has_det and has_rec:
            MODEL_TYPE = "paddleocr-custom-fullpage"
        elif has_rec:
            MODEL_TYPE = "paddleocr-custom"
        else:
            logger.info("Using PRETRAINED PaddleOCR model")
            MODEL_TYPE = "paddleocr-pretrained"

        ocr_engine = PaddleOCR(**kwargs)

        # Check GPU availability
        try:
            import paddle
            use_gpu = paddle.device.is_compiled_with_cuda()
        except Exception:
            use_gpu = False
        logger.info(f"PaddleOCR initialized — model: {MODEL_TYPE}, GPU: {use_gpu}")

    except ImportError as e:
        logger.error(f"Missing dependencies: {e}")
        logger.error("Install: pip install paddlepaddle==2.6.2 paddleocr==2.7.3")
        raise
    except Exception as e:
        logger.error(f"Failed to initialize PaddleOCR: {e}")
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, cleanup on shutdown"""
    load_model()
    yield
    logger.info("Shutting down OCR API service...")

app = FastAPI(
    title="Prescription OCR API",
    description="PaddleOCR-powered prescription image processing",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== IMAGE LOADING ====================

def load_image(image_input: str) -> np.ndarray:
    """Load image from various sources, return as numpy array for PaddleOCR"""
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

        # Resize very large images
        max_dimension = 2048
        if image.width > max_dimension or image.height > max_dimension:
            ratio = min(max_dimension / image.width, max_dimension / image.height)
            new_size = (int(image.width * ratio), int(image.height * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)

        return np.array(image)
    except Exception as e:
        raise ValueError(f"Failed to load image: {str(e)}")


# ==================== OCR WITH PADDLEOCR ====================

def run_ocr(image_array: np.ndarray) -> tuple[str, float]:
    """
    Run PaddleOCR on the full image.
    Returns (full_text, average_confidence).
    PaddleOCR returns: [[[bbox, (text, conf)], ...]]
    """
    result = ocr_engine.ocr(image_array, cls=True)

    if not result or not result[0]:
        return "", 0.0

    # Sort by y-coordinate (top-to-bottom reading order)
    items = sorted(result[0], key=lambda r: r[0][0][1])

    lines = []
    confidences = []
    for item in items:
        bbox, (text, conf) = item
        text = text.strip()
        if text:
            lines.append(text)
            confidences.append(conf)
            logger.info(f"  [{conf:.3f}] {text}")

    full_text = "\n".join(lines)
    avg_confidence = float(np.mean(confidences)) if confidences else 0.0

    return full_text, avg_confidence


# ==================== SMART PARSER ====================

def _fix_ocr_artifacts(text: str) -> str:
    """Fix common OCR misreads: O/o for 0, l for 1 in numeric contexts."""
    # Fix patterns like "10Omg" → "100mg", "5Omcg" → "50mcg"
    text = re.sub(r'(\d)[Oo](\d)', r'\g<1>0\2', text)
    text = re.sub(r'(\d)[Oo](mg|mcg|ml|g\b|IU)', r'\g<1>0\2', text, flags=re.IGNORECASE)
    return text


def parse_prescription_text(text: str) -> dict:
    """Parse prescription text to extract structured information"""
    text = _fix_ocr_artifacts(text)
    lines = text.split('\n')
    data = {
        "medications": []
    }

    # Extract patient name
    patient_match = re.search(
        r'Patient(?:\s+Name)?[:\s]+([A-Za-z\.\s]+?)(?:\n|$)', text, re.IGNORECASE
    )
    if patient_match:
        data['patientName'] = patient_match.group(1).strip()

    # Extract doctor name
    doctor_match = re.search(
        r'Doctor[:\s]+([A-Za-z\.\s]+?)(?:\n|$)', text, re.IGNORECASE
    )
    if not doctor_match:
        doctor_match = re.search(
            r'Signature[:\s]+(Dr\.?\s*[A-Za-z\.\s]+?)(?:\n|$)', text, re.IGNORECASE
        )
    if not doctor_match:
        # Standalone "DR.NAME" at end of text
        doctor_match = re.search(
            r'^(Dr\.?\s*[A-Za-z\.\s]+?)$', text, re.IGNORECASE | re.MULTILINE
        )
    if doctor_match:
        data['doctorName'] = doctor_match.group(1).strip()

    # Extract hospital / clinic name
    hospital_match = re.search(
        r'^([A-Za-z\s\.\'\-]+(?:Hospital|Clinic|Medical\s+Center|Health\s+Center|Pharmacy))',
        text, re.IGNORECASE | re.MULTILINE
    )
    if hospital_match:
        data['hospitalName'] = hospital_match.group(1).strip()

    # Extract date
    date_match = re.search(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b', text)
    if not date_match:
        date_match = re.search(r'Date[:\s]+(\S+)', text, re.IGNORECASE)
    if date_match:
        data['date'] = date_match.group(1)

    # Extract age
    age_match = re.search(r'Age[:\s]+(\d+)\s*(?:years?|yrs?)?', text, re.IGNORECASE)
    if age_match:
        data['age'] = age_match.group(1)

    # ---- Medication extraction ----
    # Dose pattern used across all formats
    dose_pattern = (
        r'(?:D[OI]SE|DOSE|POSE)[:\s]+(\d+\s*(?:mg|ml|g|mcg|IU))\s*'
        r'(Tab(?:let)?|Cap(?:sule)?|Syrup|Injection|Cream|Ointment|Drops)?'
    )

    # Format A: "1. Medicine 300mg Cap" (all on one line)
    med_pattern_a = (
        r'^\s*\d+\.\s*(.+?)\s+(\d+\s*(?:mg|ml|g|mcg|IU))\s+'
        r'(Tab(?:let)?|Cap(?:sule)?|Syrup|Injection|Cream|Ointment|Drops)'
    )
    # Format B: numbered line "1. Medicine"
    med_pattern_b = r'^\s*\d+\.\s*(\S+.*?)$'

    # Skip lines that are headers / metadata / non-medication text
    skip_keywords = {
        'patient', 'age', 'date', 'doctor', 'signature', 'rx',
        'medications', 'hospital', 'clinic', 'medical', 'center',
        'name', 'phone', 'address', 'diagnosis', 'dose', 'duration',
        'every', 'after', 'before', 'once', 'twice', 'thrice', 'as',
    }

    consumed = set()  # line indices already assigned to a medication

    i = 0
    while i < len(lines):
        line = lines[i]

        # Format A: numbered line with dose on same line
        med_a = re.search(med_pattern_a, line, re.IGNORECASE)
        if med_a:
            med_name = med_a.group(1).strip()
            dosage = med_a.group(2).strip()
            form = med_a.group(3).strip()
            frequency, duration = _scan_freq_dur(lines, i)
            data['medications'].append({
                'name': f"{med_name} {dosage} {form}",
                'dosage': dosage,
                'frequency': frequency,
                'duration': duration
            })
            consumed.add(i)
            i += 1
            continue

        # Format B: numbered line with name only
        med_b = re.search(med_pattern_b, line, re.IGNORECASE)
        if med_b:
            med_name = med_b.group(1).strip()
            # Skip if it looks like a header
            if med_name.lower().split()[0] in skip_keywords:
                i += 1
                continue
            med_info = _extract_med_details(lines, i, dose_pattern)
            if med_info:
                data['medications'].append(med_info)
                consumed.add(i)
            i += 1
            continue

        # Format C: standalone medicine name (no number prefix)
        # followed by a "Dose:" line within the next few lines
        stripped = line.strip()
        if stripped and i not in consumed:
            first_word = stripped.split()[0].lower().rstrip(':')
            is_header = first_word in skip_keywords
            # Also skip lines with colons (likely field labels), frequency patterns, or short noise
            is_metadata = (
                ':' in stripped or
                re.match(r'^\d+-\d+-\d+', stripped) or
                re.match(r'^[~\-]', stripped) or
                len(stripped) < 3
            )
            has_dose_ahead = False
            if not is_header and not is_metadata:
                for j in range(i + 1, min(i + 4, len(lines))):
                    if re.search(dose_pattern, lines[j], re.IGNORECASE):
                        has_dose_ahead = True
                        break
            if has_dose_ahead:
                med_info = _extract_med_details(lines, i, dose_pattern, name_override=stripped)
                if med_info:
                    data['medications'].append(med_info)
                    consumed.add(i)

        i += 1

    return data


def _extract_med_details(lines: list[str], start: int, dose_pattern: str, name_override: str = None) -> dict | None:
    """Look ahead from a medication line and extract dosage, frequency, duration."""
    if name_override:
        med_name = name_override
    else:
        # Extract name from numbered line
        m = re.search(r'^\s*\d+\.\s*(\S+.*?)$', lines[start])
        if not m:
            return None
        med_name = m.group(1).strip()

    dosage = form = frequency = duration = None

    for j in range(start + 1, min(start + 8, len(lines))):
        nxt = lines[j].strip()
        if not nxt:
            continue
        # Stop at next numbered medication
        if re.match(r'^\s*\d+\.', nxt):
            break
        # Stop at a standalone word that looks like another medicine name
        # (single capitalized word followed by Dose: line)
        if not re.search(r'(?:dose|duration|every|after|before|once|twice|\d+-\d+-\d+)', nxt, re.IGNORECASE):
            if j + 1 < len(lines) and re.search(dose_pattern, lines[j + 1], re.IGNORECASE):
                break
        if not dosage:
            dm = re.search(dose_pattern, nxt, re.IGNORECASE)
            if dm:
                dosage = dm.group(1).strip()
                form = dm.group(2).strip() if dm.group(2) else None
                # Check same line for frequency
                fm = re.search(
                    r'(every\s+\d+\s+hours?|after\s+meals?|before\s+meals?|\d+-\d+-\d+)',
                    nxt, re.IGNORECASE
                )
                if fm:
                    frequency = fm.group(0).strip()
        if not frequency:
            frequency = _match_frequency(nxt)
        if not duration:
            duration = _match_duration(nxt)

    if not dosage:
        return None

    name_str = med_name
    if dosage:
        name_str += f" {dosage}"
    if form:
        name_str += f" {form}"
    return {
        'name': name_str,
        'dosage': dosage,
        'frequency': frequency,
        'duration': duration
    }


def _scan_freq_dur(lines: list[str], start: int) -> tuple:
    """Look ahead from a medication line to find frequency and duration."""
    frequency = duration = None
    for j in range(start + 1, min(start + 6, len(lines))):
        nxt = lines[j].strip()
        if not nxt:
            continue
        if re.match(r'^\d+\.', nxt):
            break
        if not frequency:
            frequency = _match_frequency(nxt)
        if not duration:
            duration = _match_duration(nxt)
    return frequency, duration


def _match_frequency(text: str):
    m = re.search(
        r'((?:\d+-\d+-\d+|once|twice|thrice|three times|as needed|'
        r'every\s+\d+\s+hours?|after\s+meals?|before\s+meals?)'
        r'(?:\s*\([^)]+\))?)',
        text, re.IGNORECASE
    )
    return m.group(1).strip() if m else None


def _match_duration(text: str):
    m = re.search(r'(?:Duration:\s*)?(\d+\s*(?:day|week|month)s?)', text, re.IGNORECASE)
    return m.group(1).strip() if m else None


# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "service": "Prescription OCR API (PaddleOCR)",
        "status": "running",
        "model_loaded": ocr_engine is not None,
        "model_type": MODEL_TYPE,
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if ocr_engine is not None else "unhealthy",
        "model_loaded": ocr_engine is not None,
        "engine": "PaddleOCR",
        "model_type": MODEL_TYPE,
    }

@app.post("/process", response_model=OCRResponse)
async def process_prescription(request: OCRRequest):
    """Process prescription image using PaddleOCR"""

    if ocr_engine is None:
        raise HTTPException(status_code=503, detail="OCR engine not loaded")

    import time
    start_time = time.time()

    try:
        logger.info("=" * 60)
        logger.info(f"New OCR Request ({MODEL_TYPE})")
        logger.info("=" * 60)

        # Load image
        t1 = time.time()
        image_array = load_image(request.imageSource)
        load_time = time.time() - t1
        h, w = image_array.shape[:2]
        logger.info(f"Image loaded: {w}x{h} ({load_time:.2f}s)")

        # Run PaddleOCR (detection + recognition in one step)
        t2 = time.time()
        predicted_text, confidence = run_ocr(image_array)
        ocr_time = time.time() - t2
        logger.info(f"OCR completed: {len(predicted_text)} chars ({ocr_time:.2f}s)")

        # Parse structured data
        t3 = time.time()
        extracted_data = parse_prescription_text(predicted_text)
        parse_time = time.time() - t3

        total_time = time.time() - start_time

        logger.info("=" * 60)
        logger.info("Performance:")
        logger.info(f"   Image Loading:  {load_time:.2f}s")
        logger.info(f"   PaddleOCR:      {ocr_time:.2f}s")
        logger.info(f"   Parsing:        {parse_time:.2f}s")
        logger.info(f"   TOTAL:          {total_time:.2f}s")
        logger.info(f"Confidence:      {confidence:.3f} ({confidence*100:.1f}%)")
        logger.info(f"Medications:     {len(extracted_data.get('medications', []))}")
        logger.info("=" * 60)

        return OCRResponse(
            success=True,
            text=predicted_text,
            confidence=round(confidence, 4),
            extractedData=extracted_data,
            modelType=MODEL_TYPE,
            device="gpu" if _has_gpu() else "cpu",
        )

    except ValueError as e:
        logger.error(f"Image loading error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Processing error: {e}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


def _has_gpu() -> bool:
    try:
        import paddle
        return paddle.device.is_compiled_with_cuda()
    except Exception:
        return False


# ==================== CLI TEST MODE ====================

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Quick test: python api_service.py test <image_path>
        load_model()
        test_path = sys.argv[2] if len(sys.argv) > 2 else "test_data/prescription_0001_high.png"
        print(f"\n{'='*60}")
        print(f"Testing: {test_path}")
        print(f"{'='*60}")
        img = np.array(Image.open(test_path).convert('RGB'))
        text, confidence = run_ocr(img)
        extracted = parse_prescription_text(text)
        print(f"\n--- OCR Output ---")
        print(text)
        print(f"\n--- Confidence: {confidence:.4f} ({confidence*100:.1f}%) ---")
        print(f"\n--- Extracted Data ---")
        for key, val in extracted.items():
            print(f"  {key}: {val}")
    else:
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            log_level="info"
        )
