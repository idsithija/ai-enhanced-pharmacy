"""
Custom OCR Model Service
Python service that loads and runs the custom TrOCR model for prescription OCR.
Called by Node.js backend via subprocess.
"""

import sys
import json
import base64
from pathlib import Path
from io import BytesIO
from PIL import Image

# Check if model exists
MODEL_DIR = Path(__file__).parent.parent.parent / "ml-models" / "prescription-ocr" / "model"

def check_dependencies():
    """Check if required ML libraries are installed"""
    try:
        import torch
        from transformers import TrOCRProcessor, VisionEncoderDecoderModel
        return True
    except ImportError:
        return False

def load_image(image_input):
    """Load image from base64 string or file path"""
    try:
        if image_input.startswith('data:image'):
            # Base64 data URL
            image_data = image_input.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        elif image_input.startswith('/') or ':\\' in image_input or image_input.startswith('http'):
            # File path or URL
            if image_input.startswith('http'):
                import requests
                response = requests.get(image_input)
                image_bytes = response.content
            else:
                with open(image_input, 'rb') as f:
                    image_bytes = f.read()
        else:
            # Plain base64 string
            image_bytes = base64.b64decode(image_input)
        
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        return image
    except Exception as e:
        raise ValueError(f"Failed to load image: {str(e)}")

def process_with_custom_model(image_input):
    """Process image using custom TrOCR model"""
    
    # Check if model exists
    if not MODEL_DIR.exists():
        return {
            "success": False,
            "error": "Custom model not found. Please train the model first.",
            "modelPath": str(MODEL_DIR)
        }
    
    # Check dependencies
    if not check_dependencies():
        return {
            "success": False,
            "error": "ML dependencies not installed. Run: pip install torch transformers",
            "hint": "Or use the fallback Tesseract service"
        }
    
    try:
        import torch
        from transformers import TrOCRProcessor, VisionEncoderDecoderModel
        
        # Load model and processor
        processor = TrOCRProcessor.from_pretrained(str(MODEL_DIR))
        model = VisionEncoderDecoderModel.from_pretrained(str(MODEL_DIR))
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model.to(device)
        model.eval()
        
        # Load and process image
        image = load_image(image_input)
        
        # Generate prediction
        pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)
        
        with torch.no_grad():
            generated_ids = model.generate(pixel_values)
        
        predicted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        # Extract structured data from text (basic parsing)
        extracted_data = parse_prescription_text(predicted_text)
        
        return {
            "success": True,
            "text": predicted_text,
            "confidence": 0.90,  # TrOCR doesn't provide confidence, use default high value
            "extractedData": extracted_data,
            "modelType": "custom-trocr",
            "device": device
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Model processing error: {str(e)}",
            "traceback": str(e)
        }

def parse_prescription_text(text):
    """Parse prescription text to extract structured information"""
    import re
    
    lines = text.split('\n')
    data = {
        "medications": []
    }
    
    # Extract patient name
    patient_match = re.search(r'Patient[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', text, re.IGNORECASE)
    if patient_match:
        data['patientName'] = patient_match.group(1)
    
    # Extract doctor name
    doctor_match = re.search(r'(?:Dr\.|Doctor)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', text, re.IGNORECASE)
    if doctor_match:
        data['doctorName'] = doctor_match.group(1)
    
    # Extract hospital
    hospital_match = re.search(r'(?:Hospital|Clinic)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', text, re.IGNORECASE)
    if hospital_match:
        data['hospitalName'] = hospital_match.group(1)
    
    # Extract date
    date_match = re.search(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b', text)
    if date_match:
        data['date'] = date_match.group(1)
    
    # Extract medications (simple heuristic)
    med_keywords = ['mg', 'ml', 'tablet', 'capsule', 'syrup', 'daily', 'twice', 'thrice']
    for line in lines:
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in med_keywords):
            # Extract dosage
            dosage_match = re.search(r'(\d+\s*(?:mg|ml|g|mcg))', line, re.IGNORECASE)
            # Extract frequency
            freq_match = re.search(r'(once|twice|thrice|[\d-]+)\s*(?:daily|a day)?', line, re.IGNORECASE)
            # Extract duration
            duration_match = re.search(r'(\d+\s*(?:day|week|month)s?)', line, re.IGNORECASE)
            
            data['medications'].append({
                'name': line.strip(),
                'dosage': dosage_match.group(1) if dosage_match else None,
                'frequency': freq_match.group(0) if freq_match else None,
                'duration': duration_match.group(1) if duration_match else None
            })
    
    return data

if __name__ == "__main__":
    # Read input from command line argument
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "No image input provided"
        }))
        sys.exit(1)
    
    image_input = sys.argv[1]
    
    # Process image
    result = process_with_custom_model(image_input)
    
    # Output JSON result
    print(json.dumps(result, indent=2))
