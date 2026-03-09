"""
Test if the trained model can actually read prescription images
"""
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import json
from pathlib import Path

print("=" * 60)
print("TESTING MODEL READING CAPABILITY")
print("=" * 60)

# Load model and processor
model_path = "../model"
print(f"\n[*] Loading model from: {model_path}")
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained(model_path)
model.eval()
print("[✓] Model loaded successfully")

# Load metadata to get ground truth
metadata_path = Path("../data/metadata.json")
with open(metadata_path, 'r', encoding='utf-8') as f:
    metadata = json.load(f)

# Test with first 3 training images
test_images = ["prescription_0001_medium.png", "prescription_0027_low.png", "prescription_0050_high.png"]

print("\n" + "=" * 60)
print("TESTING WITH TRAINING IMAGES")
print("=" * 60)

for img_name in test_images:
    print(f"\n{'='*60}")
    print(f"Testing: {img_name}")
    print(f"{'='*60}")
    
    # Load image
    img_path = Path("../data") / img_name
    if not img_path.exists():
        print(f"[!] Image not found: {img_path}")
        continue
        
    image = Image.open(img_path).convert("RGB")
    
    # Find ground truth from metadata
    img_id = img_name.replace("_medium.png", "").replace("_low.png", "").replace("_high.png", "")
    ground_truth = None
    for item in metadata:
        if item['id'] == img_id:
            ground_truth = item
            break
    
    if ground_truth:
        print(f"\n[GROUND TRUTH]")
        print(f"Hospital: {ground_truth['hospital']}")
        print(f"Patient: {ground_truth['patient_name']}")
        print(f"Doctor: {ground_truth['doctor']}")
        print(f"Date: {ground_truth['date']}")
        print(f"Medications: {len(ground_truth['medications'])}")
        if ground_truth['medications']:
            print(f"  First Med: {ground_truth['medications'][0]['name']}")
    
    # Generate prediction
    print(f"\n[PREDICTING...]")
    pixel_values = processor(image, return_tensors="pt").pixel_values
    
    with torch.no_grad():
        generated_ids = model.generate(
            pixel_values,
            max_length=512,
            num_beams=4,
            early_stopping=True,
            no_repeat_ngram_size=3
        )
    
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    print(f"\n[MODEL OUTPUT]")
    print(generated_text[:500])  # First 500 chars
    
    # Check if key entities match
    if ground_truth:
        hospital_match = ground_truth['hospital'].lower() in generated_text.lower()
        patient_match = ground_truth['patient_name'].lower() in generated_text.lower()
        
        print(f"\n[VERIFICATION]")
        print(f"Hospital Match: {'✓' if hospital_match else '✗'} ({ground_truth['hospital']})")
        print(f"Patient Match: {'✓' if patient_match else '✗'} ({ground_truth['patient_name']})")
        
        if hospital_match and patient_match:
            print("[✓] Model can READ this training image correctly!")
        else:
            print("[✗] Model is NOT reading correctly - OVERFITTING or MODEL LOADING ISSUE!")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
