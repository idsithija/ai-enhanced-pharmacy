"""
Comprehensive Model Testing - Compare Predictions vs Ground Truth
"""
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
from pathlib import Path
import random
import re

print("=" * 70)
print("MODEL VERIFICATION TEST")
print("=" * 70)

# Load model
model_path = Path("../model")
print(f"\n[1/4] Loading trained model from: {model_path}")
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained(str(model_path))
model.eval()
print("[OK] Model loaded successfully")

# Get all images
data_dir = Path("../data")
labels_dir = data_dir / "labels"
all_images = sorted(list(data_dir.glob("prescription_*.png")))
print(f"[OK] Found {len(all_images)} prescription images")

# Select 5 random images for testing
print("\n[2/4] Selecting test images...")
random.seed(42)
test_images = random.sample(all_images, min(5, len(all_images)))

print(f"[OK] Testing with {len(test_images)} images:")
for img in test_images:
    print(f"     - {img.name}")

# Helper function to extract key info
def extract_info(text):
    """Extract hospital and patient name from text"""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    hospital = lines[0] if lines else ""
    
    patient = ""
    for line in lines:
        if "Patient Name:" in line:
            patient = line.replace("Patient Name:", "").strip()
            break
    
    return hospital, patient

# Test each image
print("\n[3/4] Running predictions...")
print("=" * 70)

correct_hospitals = 0
correct_patients = 0
total_tests = 0

for img_path in test_images:
    print(f"\n{'='*70}")
    print(f"IMAGE: {img_path.name}")
    print(f"{'='*70}")
    
    # Extract ID number (prescription_0015_medium.png -> 15)
    parts = img_path.stem.split('_')
    img_num = int(parts[1])
    
    # Find label file
    label_file = labels_dir / f"prescription_{parts[1]}.txt"
    if not label_file.exists():
        print(f"[!] Label file not found: {label_file.name}")
        continue
    
    # Read ground truth
    with open(label_file, 'r', encoding='utf-8') as f:
        ground_truth_text = f.read().strip()
    
    gt_hospital, gt_patient = extract_info(ground_truth_text)
    
    # Load and process image
    image = Image.open(img_path).convert("RGB")
    
    # Generate prediction
    print("\n[PREDICTING...]")
    pixel_values = processor(image, return_tensors="pt").pixel_values
    
    with torch.no_grad():
        generated_ids = model.generate(
            pixel_values,
            max_length=512,
            num_beams=4,
            early_stopping=True,
            no_repeat_ngram_size=3
        )
    
    predicted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    pred_hospital, pred_patient = extract_info(predicted_text)
    
    # Display results
    print(f"\n[GROUND TRUTH]")
    print(f"Hospital:  {gt_hospital}")
    print(f"Patient:   {gt_patient}")
    
    print(f"\n[PREDICTED]")
    print(f"Hospital:  {pred_hospital}")
    print(f"Patient:   {pred_patient}")
    
    print(f"\n[FULL PREDICTED TEXT - First 400 chars]")
    print(predicted_text[:400])
    print("...")
    
    # Verify key fields (case-insensitive partial match)
    hospital_correct = gt_hospital.lower() in predicted_text.lower()
    patient_correct = gt_patient.lower() in predicted_text.lower()
    
    print(f"\n[VERIFICATION]")
    print(f"[*] Hospital Match: {'YES [OK]' if hospital_correct else 'NO [FAIL] (PROBLEM!)'}")
    print(f"[*] Patient Match:  {'YES [OK]' if patient_correct else 'NO [FAIL] (PROBLEM!)'}")
    
    if hospital_correct:
        correct_hospitals += 1
    if patient_correct:
        correct_patients += 1
    total_tests += 1
    
    # Overall verdict for this image
    if hospital_correct and patient_correct:
        print(f"\n[RESULT] [OK] CORRECT - Model is reading this image properly!")
    else:
        print(f"\n[RESULT] [FAIL] INCORRECT - Model is NOT reading correctly!")
        if not hospital_correct:
            print(f"   Expected Hospital: '{gt_hospital}'")
            print(f"   Got Hospital: '{pred_hospital}'")
        if not patient_correct:
            print(f"   Expected Patient: '{gt_patient}'")
            print(f"   Got Patient: '{pred_patient}'")

# Summary
print("\n" + "=" * 70)
print("FINAL RESULTS")
print("=" * 70)
print(f"\nImages Tested: {total_tests}")
print(f"Hospital Field Accuracy: {correct_hospitals}/{total_tests} ({100*correct_hospitals/total_tests if total_tests > 0 else 0:.1f}%)")
print(f"Patient Field Accuracy: {correct_patients}/{total_tests} ({100*correct_patients/total_tests if total_tests > 0 else 0:.1f}%)")

if correct_hospitals == total_tests and correct_patients == total_tests:
    print("\n[OK] SUCCESS! Model is reading prescriptions correctly!")
    print("   No overfitting detected - model generalizes well.")
elif correct_hospitals >= total_tests * 0.8:
    print("\n[WARNING] MOSTLY WORKING - Some errors but generally correct")
    print("   Model may need more training or data.")
else:
    print("\n[FAIL] PROBLEM! Model is still overfitting or hallucinating")
    print("   Model needs to be retrained with more diverse data.")

print("=" * 70)
