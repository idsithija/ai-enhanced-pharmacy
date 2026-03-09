"""
PaddleOCR Model Evaluation Script
==================================
Test the trained PaddleOCR recognition model against test prescriptions.

Usage:
  python evaluate_model.py                    # Test with both test images
  python evaluate_model.py --image <path>     # Test single image
  python evaluate_model.py --pretrained       # Compare pretrained vs custom
"""

import argparse
import time
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent  # ml-models/prescription-ocr/
TEST_DATA_DIR = BASE_DIR / "test_data"
MODEL_DIR = BASE_DIR / "model" / "inference"
DICT_FILE = BASE_DIR / "training_data" / "en_dict.txt"

# Ground truth for known test images
GROUND_TRUTH = {
    "prescription_0001_high.png": {
        "hospital": "City Medical Center",
        "patient": "Michael Chen",
        "doctor": "Dr. Rohan Jayasuriya",
        "medicines": ["Gabapentin 300mg Cap"],
    },
    "prescription_0005_high.png": {
        "hospital": "St. Michael's Medical Center",
        "patient": "Melissa Green",
        "doctor": "Dr. K. Perera",
        "medicines": [
            "Amoxicillin 500mg Cap",
            "Tramadol 50mg Tab",
            "Ibuprofen 200mg Tab",
            "Levothyroxine 50mcg Tab",
        ],
    },
}


def load_paddleocr(use_custom=True):
    """Load PaddleOCR with custom or pretrained model."""
    from paddleocr import PaddleOCR

    if use_custom and MODEL_DIR.exists() and any(MODEL_DIR.glob("*.pdmodel")):
        print(f"Loading CUSTOM model from {MODEL_DIR}")
        ocr = PaddleOCR(
            use_angle_cls=True,
            lang='en',
            show_log=False,
            rec_model_dir=str(MODEL_DIR),
            rec_char_dict_path=str(DICT_FILE) if DICT_FILE.exists() else None,
        )
        return ocr, "custom"
    else:
        print("Loading PRETRAINED PaddleOCR model")
        ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        return ocr, "pretrained"


def run_ocr(ocr, image_path):
    """Run OCR on a single image."""
    start = time.time()
    result = ocr.ocr(str(image_path), cls=True)
    elapsed = time.time() - start

    lines = []
    if result and result[0]:
        for item in result[0]:
            bbox, (text, conf) = item
            lines.append({"text": text, "confidence": conf, "bbox": bbox})

    avg_conf = sum(l["confidence"] for l in lines) / len(lines) if lines else 0
    return lines, avg_conf, elapsed


def evaluate_image(ocr, image_path, model_type):
    """Evaluate OCR on a single image, compare to ground truth if available."""
    print(f"\n{'=' * 60}")
    print(f"Image: {image_path.name}  |  Model: {model_type}")
    print("=" * 60)

    lines, avg_conf, elapsed = run_ocr(ocr, image_path)
    full_text = "\n".join(l["text"] for l in lines)

    print(f"\nOCR Output ({len(lines)} lines, {elapsed:.2f}s, avg conf: {avg_conf:.1%}):")
    for l in lines:
        print(f"  [{l['confidence']:.3f}] {l['text']}")

    # Compare to ground truth
    gt = GROUND_TRUTH.get(image_path.name)
    if gt:
        print(f"\n--- Ground Truth Comparison ---")
        score = check_ground_truth(full_text, gt)
        print(f"   Match score: {score:.0%}")
        return score, avg_conf
    return None, avg_conf


def check_ground_truth(ocr_text, gt):
    """Check how well OCR matches ground truth."""
    text_lower = ocr_text.lower()
    total = 0
    matched = 0

    # Check hospital
    total += 1
    if gt["hospital"].lower() in text_lower:
        matched += 1
        print(f"   [PASS] Hospital: {gt['hospital']}")
    else:
        print(f"   [FAIL] Hospital: expected '{gt['hospital']}'")

    # Check patient
    total += 1
    if gt["patient"].lower() in text_lower:
        matched += 1
        print(f"   [PASS] Patient: {gt['patient']}")
    else:
        print(f"   [FAIL] Patient: expected '{gt['patient']}'")

    # Check doctor
    total += 1
    if gt["doctor"].lower() in text_lower:
        matched += 1
        print(f"   [PASS] Doctor: {gt['doctor']}")
    else:
        print(f"   [FAIL] Doctor: expected '{gt['doctor']}'")

    # Check medicines
    for med in gt["medicines"]:
        total += 1
        med_name = med.split()[0].lower()
        if med_name in text_lower:
            matched += 1
            print(f"   [PASS] Medicine: {med}")
        else:
            print(f"   [FAIL] Medicine: expected '{med}'")

    return matched / total if total > 0 else 0


def main():
    parser = argparse.ArgumentParser(description="Evaluate PaddleOCR model")
    parser.add_argument("--image", type=str, help="Path to a specific image to test")
    parser.add_argument("--pretrained", action="store_true", help="Compare pretrained vs custom model")
    args = parser.parse_args()

    if args.image:
        images = [Path(args.image)]
    else:
        images = sorted(TEST_DATA_DIR.glob("*.png"))
        if not images:
            print("No test images found in test_data/")
            return

    if args.pretrained:
        # Compare both models
        print("\n" + "=" * 60)
        print("COMPARING PRETRAINED vs CUSTOM MODEL")
        print("=" * 60)

        for model_flag in [False, True]:
            label = "CUSTOM" if model_flag else "PRETRAINED"
            print(f"\n{'#' * 60}")
            print(f"  MODEL: {label}")
            print(f"{'#' * 60}")
            ocr, mtype = load_paddleocr(use_custom=model_flag)
            for img in images:
                evaluate_image(ocr, img, mtype)
    else:
        ocr, model_type = load_paddleocr(use_custom=True)
        scores = []
        confs = []
        for img in images:
            score, conf = evaluate_image(ocr, img, model_type)
            if score is not None:
                scores.append(score)
            confs.append(conf)

        print(f"\n{'=' * 60}")
        print("SUMMARY")
        print(f"   Images tested:     {len(images)}")
        print(f"   Model:             {model_type}")
        print(f"   Avg confidence:    {sum(confs)/len(confs):.1%}")
        if scores:
            print(f"   Avg ground truth:  {sum(scores)/len(scores):.0%}")
        print("=" * 60)


if __name__ == "__main__":
    main()
