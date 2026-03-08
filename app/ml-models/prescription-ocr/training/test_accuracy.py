"""
Test OCR Model Accuracy
Tests the trained custom model against ground truth labels
"""

import os
import json
from pathlib import Path
from PIL import Image
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from tqdm import tqdm
import numpy as np

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
MODEL_DIR = Path(__file__).parent.parent / "model"
DATA_DIR = Path(__file__).parent.parent / "data"
LABELS_DIR = DATA_DIR / "labels"

# Device
device = "cuda" if torch.cuda.is_available() else "cpu"

print("=" * 60)
print("OCR MODEL ACCURACY TEST")
print("=" * 60)
print(f"Device: {device}")
print(f"Model: {MODEL_DIR}")
print(f"Test data: {DATA_DIR}")
print("=" * 60)


def compute_cer(pred_str, label_str):
    """Compute Character Error Rate"""
    try:
        import editdistance
        distance = editdistance.eval(pred_str, label_str)
        return distance / max(len(label_str), 1)
    except ImportError:
        # Simple character-level accuracy fallback
        matches = sum(1 for a, b in zip(pred_str, label_str) if a == b)
        return 1 - (matches / max(len(label_str), 1))


def test_model():
    """Test the trained model"""
    
    # Check if model exists
    if not MODEL_DIR.exists():
        print(f"\n❌ Error: Model not found at {MODEL_DIR}")
        print("   Please train the model first: python train.py")
        return
    
    # Load model and processor
    print("\n📦 Loading model...")
    processor = TrOCRProcessor.from_pretrained(str(MODEL_DIR))
    model = VisionEncoderDecoderModel.from_pretrained(str(MODEL_DIR))
    model.to(device)
    model.eval()
    print("✓ Model loaded successfully")
    
    # Get test images (last 20% of dataset)
    all_images = sorted(list(DATA_DIR.glob("*.png")))
    split_idx = int(len(all_images) * 0.8)
    test_images = all_images[split_idx:]
    
    print(f"\n📊 Testing on {len(test_images)} images...")
    
    # Test metrics
    cer_scores = []
    word_accuracies = []
    predictions = []
    
    # Test each image
    for image_path in tqdm(test_images, desc="Testing"):
        # Load image
        image = Image.open(image_path).convert("RGB")
        
        # Load ground truth
        label_file = LABELS_DIR / f"{image_path.stem.split('_')[0]}_{image_path.stem.split('_')[1]}.txt"
        if not label_file.exists():
            continue
            
        with open(label_file, 'r', encoding='utf-8') as f:
            ground_truth = f.read().strip()
        
        # Generate prediction
        pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)
        
        with torch.no_grad():
            generated_ids = model.generate(pixel_values)
        
        predicted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        # Compute metrics
        cer = compute_cer(predicted_text, ground_truth)
        cer_scores.append(cer)
        
        # Word-level accuracy
        pred_words = set(predicted_text.lower().split())
        true_words = set(ground_truth.lower().split())
        if true_words:
            word_acc = len(pred_words & true_words) / len(true_words)
            word_accuracies.append(word_acc)
        
        # Store prediction
        predictions.append({
            'image': image_path.name,
            'ground_truth': ground_truth[:100] + "..." if len(ground_truth) > 100 else ground_truth,
            'predicted': predicted_text[:100] + "..." if len(predicted_text) > 100 else predicted_text,
            'cer': cer,
            'word_accuracy': word_acc if true_words else 0
        })
    
    # Calculate statistics
    avg_cer = np.mean(cer_scores)
    avg_word_acc = np.mean(word_accuracies)
    char_accuracy = (1 - avg_cer) * 100
    word_accuracy = avg_word_acc * 100
    
    # Display results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"Character Accuracy: {char_accuracy:.2f}%")
    print(f"Word Accuracy: {word_accuracy:.2f}%")
    print(f"Character Error Rate (CER): {avg_cer:.4f}")
    print(f"Tested Images: {len(test_images)}")
    print("=" * 60)
    
    # Show sample predictions
    print("\n📝 Sample Predictions (first 3):")
    print("=" * 60)
    for i, pred in enumerate(predictions[:3], 1):
        print(f"\nSample {i}: {pred['image']}")
        print(f"Ground Truth: {pred['ground_truth']}")
        print(f"Predicted:    {pred['predicted']}")
        print(f"CER: {pred['cer']:.4f} | Word Acc: {pred['word_accuracy']:.2%}")
        print("-" * 60)
    
    # Save detailed results
    results_file = Path(__file__).parent / "test_results.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump({
            'summary': {
                'character_accuracy': char_accuracy,
                'word_accuracy': word_accuracy,
                'cer': avg_cer,
                'num_images': len(test_images)
            },
            'predictions': predictions
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Detailed results saved to: {results_file}")
    
    # Performance assessment
    print("\n🎯 Performance Assessment:")
    if char_accuracy >= 90:
        print("   ✅ Excellent! Ready for production use")
    elif char_accuracy >= 85:
        print("   ✅ Good! Suitable for most use cases")
    elif char_accuracy >= 75:
        print("   ⚠️  Fair. Consider more training data or epochs")
    else:
        print("   ❌ Poor. Check training data quality and increase epochs")
    
    print("\n🚀 Next steps:")
    print("   1. Backend will automatically use this model")
    print("   2. See ml-models/prescription-ocr/README.md for integration")
    print("   3. Test in UI: Upload prescription in frontend")


if __name__ == "__main__":
    test_model()
