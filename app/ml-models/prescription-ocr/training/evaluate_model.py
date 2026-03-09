"""
Verify line-level model by testing on generated prescription images.
Tests the full pipeline: line detection → TrOCR per line → combine.
"""
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
from pathlib import Path
import random
import numpy as np
import cv2

print("=" * 70)
print("LINE-LEVEL MODEL VERIFICATION")
print("=" * 70)

# Load model
model_path = Path("../model")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"\n[1/4] Loading model from {model_path} on {device}...")
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained(str(model_path))
model.to(device)
model.eval()
print("[OK] Model loaded")


def _projection_lines(binary, image, threshold_pct):
    h_proj = np.sum(binary, axis=1)
    if np.max(h_proj) == 0:
        return []
    threshold = max(200, np.max(h_proj) * threshold_pct)
    text_rows = h_proj > threshold
    lines = []
    in_line = False; start = 0
    for i in range(len(text_rows)):
        if text_rows[i] and not in_line:
            start = i; in_line = True
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


def detect_text_lines(image):
    """Detect text lines using multi-strategy approach"""
    img_array = np.array(image)
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    results = []

    # Method 1: Contour-based
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
    merged = []
    for box in boxes:
        x, y, w, h = box
        if merged:
            px, py, pw, ph = merged[-1]
            overlap = min(py + ph, y + h) - max(py, y)
            if overlap > 0.5 * min(ph, h):
                nx = min(px, x); ny = min(py, y)
                nw = max(px + pw, x + w) - nx; nh = max(py + ph, y + h) - ny
                merged[-1] = (nx, ny, nw, nh); continue
        merged.append(box)
    contour_crops = [image.crop((max(0,x-8), max(0,y-8), min(image.width,x+w+8), min(image.height,y+h+8))) for x,y,w,h in merged]
    results.append(contour_crops)

    # Method 2: Projection with morph-open
    kernel_clean = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_clean)
    results.append(_projection_lines(cleaned, image, 0.05))

    # Method 3: Fixed threshold + projection
    _, binary_fixed = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
    results.append(_projection_lines(binary_fixed, image, 0.02))

    # Pick method with most lines in range [5, 30]
    best = max(results, key=lambda r: len(r) if 5 <= len(r) <= 30 else 0)
    if len(best) < 5:
        best = max(results, key=lambda r: len(r))
    return best


def ocr_line(line_img):
    """OCR a single line"""
    pixel_values = processor(line_img, return_tensors="pt").pixel_values.to(device)
    with torch.no_grad():
        ids = model.generate(pixel_values, max_length=64, num_beams=4, early_stopping=True)
    return processor.batch_decode(ids, skip_special_tokens=True)[0].strip()


# Test on prescription images
data_dir = Path("../test_data")
labels_dir = data_dir / "labels"
all_images = sorted(list(data_dir.glob("prescription_*.png")))
print(f"[OK] Found {len(all_images)} prescription images")

print("\n[2/4] Testing line pipeline on 3 random images...\n")
random.seed(123)
test_images = random.sample(all_images, min(3, len(all_images)))

for img_path in test_images:
    print("=" * 70)
    print(f"IMAGE: {img_path.name}")
    print("=" * 70)

    # Read ground truth
    parts = img_path.stem.split('_')
    label_file = labels_dir / f"prescription_{parts[1]}.txt"
    if label_file.exists():
        gt = label_file.read_text(encoding='utf-8').strip()
        gt_lines = [l.strip() for l in gt.split('\n') if l.strip()]
        print(f"\n  GROUND TRUTH ({len(gt_lines)} lines):")
        for l in gt_lines[:6]:
            print(f"    {l}")
        if len(gt_lines) > 6:
            print(f"    ... ({len(gt_lines) - 6} more lines)")

    # Run pipeline
    image = Image.open(img_path).convert("RGB")
    line_imgs = detect_text_lines(image)
    print(f"\n  DETECTED {len(line_imgs)} lines")

    print(f"\n  PREDICTED TEXT:")
    predicted_lines = []
    for i, li in enumerate(line_imgs):
        text = ocr_line(li)
        predicted_lines.append(text)
        print(f"    [{i+1:2d}] {text}")

    # Check key fields
    full_text = "\n".join(predicted_lines)
    gt_hospital = gt_lines[0] if gt_lines else ""
    gt_patient = ""
    for l in gt_lines:
        if "Patient Name:" in l:
            gt_patient = l.replace("Patient Name:", "").strip()
            break

    pred_hospital = predicted_lines[0] if predicted_lines else ""
    pred_patient = ""
    for l in predicted_lines:
        if "Patient" in l and ":" in l:
            pred_patient = l.split(":")[-1].strip()
            break

    h_match = gt_hospital.lower() in pred_hospital.lower() or pred_hospital.lower() in gt_hospital.lower()
    p_match = gt_patient.lower() == pred_patient.lower()

    print(f"\n  ACCURACY CHECK:")
    print(f"    Hospital: Expected='{gt_hospital}' Got='{pred_hospital}' {'[OK]' if h_match else '[FAIL]'}")
    print(f"    Patient:  Expected='{gt_patient}' Got='{pred_patient}' {'[OK]' if p_match else '[FAIL]'}")
    print()

print("=" * 70)
print("VERIFICATION COMPLETE")
print("=" * 70)
