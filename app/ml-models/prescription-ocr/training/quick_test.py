"""Quick test to verify if model is trained"""
import sys
from pathlib import Path
from PIL import Image
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

MODEL_DIR = Path(__file__).parent.parent / "model"
DATA_DIR = Path(__file__).parent.parent / "data"

print("Loading model from:", MODEL_DIR)
processor = TrOCRProcessor.from_pretrained(str(MODEL_DIR))
model = VisionEncoderDecoderModel.from_pretrained(str(MODEL_DIR))
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
model.eval()

# Test prescription_0001
image_path = DATA_DIR / "prescription_0001_medium.png"
label_path = DATA_DIR / "labels" / "prescription_0001.txt"

print(f"\nTesting: {image_path.name}")
image = Image.open(image_path).convert("RGB")

# Process
pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)
generated_ids = model.generate(pixel_values, max_length=512)
generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

# Load ground truth
with open(label_path, 'r', encoding='utf-8') as f:
    ground_truth = f.read().strip()

print("\n" + "="*60)
print("GROUND TRUTH:")
print("="*60)
print(ground_truth)
print("\n" + "="*60)
print("MODEL OUTPUT:")
print("="*60)
print(generated_text)
print("="*60)

# Check if it matches
patient_in_output = "Ayesha Pathirana" in generated_text
print(f"\n✓ Patient name correct: {patient_in_output}")
print(f"✓ Model is {'TRAINED' if patient_in_output else 'BASE (NOT TRAINED)'}")
