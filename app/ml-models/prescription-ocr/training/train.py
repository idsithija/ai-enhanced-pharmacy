"""
Train Custom OCR Model for Medical Prescriptions
Uses TrOCR (Transformer-based OCR) with Transfer Learning

This script trains a custom OCR model fine-tuned on prescription images.
"""

import os
import json
import torch
from PIL import Image
from pathlib import Path
from torch.utils.data import Dataset, DataLoader
from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    default_data_collator
)
import numpy as np
from tqdm import tqdm

# ==================== CONFIGURATION ====================

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
DATA_DIR = Path(__file__).parent.parent / "data"
LABELS_DIR = DATA_DIR / "labels"
OUTPUT_DIR = Path(__file__).parent.parent / "model"

# Model settings
BASE_MODEL = "microsoft/trocr-base-printed"  # Pre-trained TrOCR
MAX_LENGTH = 256  # Maximum text length
BATCH_SIZE = 2    # Reduced to help prevent training hangs
NUM_EPOCHS = 5    # Start with 5, can increase to 10
LEARNING_RATE = 5e-5

# Device
device = "cuda" if torch.cuda.is_available() else "cpu"

print("=" * 60)
print("PRESCRIPTION OCR MODEL TRAINING")
print("=" * 60)
print(f"Device: {device}")
print(f"Data directory: {DATA_DIR}")
print(f"Output directory: {OUTPUT_DIR}")
print(f"Base model: {BASE_MODEL}")
print("=" * 60)

if device == "cpu":
    print("\n[!] WARNING: Training on CPU will be SLOW (8-12 hours)")
    print("   Recommendation: Use Google Colab with free GPU")
    print("   Visit: https://colab.research.google.com\n")


# ==================== DATASET ====================

class PrescriptionDataset(Dataset):
    """Custom dataset for prescription images"""
    
    def __init__(self, data_dir, labels_dir, processor, split='train'):
        self.data_dir = Path(data_dir)
        self.labels_dir = Path(labels_dir)
        self.processor = processor
        
        # Get all image files
        self.image_files = sorted(list(self.data_dir.glob("*.png")))
        
        # Split into train/validation (80/20)
        split_idx = int(len(self.image_files) * 0.8)
        if split == 'train':
            self.image_files = self.image_files[:split_idx]
        else:
            self.image_files = self.image_files[split_idx:]
        
        print(f"Loaded {len(self.image_files)} images for {split}")
    
    def __len__(self):
        return len(self.image_files)
    
    def __getitem__(self, idx):
        # Load image
        image_path = self.image_files[idx]
        image = Image.open(image_path).convert("RGB")
        
        # Load ground truth label
        label_path = self.labels_dir / f"{image_path.stem.split('_')[0]}_{image_path.stem.split('_')[1]}.txt"
        with open(label_path, 'r', encoding='utf-8') as f:
            text = f.read().strip()
        
        # Process image
        pixel_values = self.processor(image, return_tensors="pt").pixel_values
        
        # Tokenize text
        labels = self.processor.tokenizer(
            text,
            padding="max_length",
            max_length=MAX_LENGTH,
            truncation=True,
            return_tensors="pt"
        ).input_ids
        
        # Replace padding token with -100 (ignored in loss)
        labels[labels == self.processor.tokenizer.pad_token_id] = -100
        
        return {
            "pixel_values": pixel_values.squeeze(),
            "labels": labels.squeeze()
        }


# ==================== METRICS ====================

def compute_cer(pred_str, label_str):
    """Compute Character Error Rate using simple character-level comparison"""
    # Simple Levenshtein distance implementation (no external dependency)
    if len(pred_str) == 0:
        return float(len(label_str))
    if len(label_str) == 0:
        return float(len(pred_str))
    
    # Create matrix
    d = [[0] * (len(label_str) + 1) for _ in range(len(pred_str) + 1)]
    
    for i in range(len(pred_str) + 1):
        d[i][0] = i
    for j in range(len(label_str) + 1):
        d[0][j] = j
    
    # Fill matrix
    for i in range(1, len(pred_str) + 1):
        for j in range(1, len(label_str) + 1):
            cost = 0 if pred_str[i-1] == label_str[j-1] else 1
            d[i][j] = min(
                d[i-1][j] + 1,      # deletion
                d[i][j-1] + 1,      # insertion
                d[i-1][j-1] + cost  # substitution
            )
    
    return d[len(pred_str)][len(label_str)] / max(len(label_str), 1)


def compute_metrics(pred):
    """Compute evaluation metrics during training"""
    labels_ids = pred.label_ids
    pred_ids = pred.predictions
    
    # Replace -100 with pad token
    labels_ids[labels_ids == -100] = processor.tokenizer.pad_token_id
    
    # Decode predictions and labels
    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    labels_str = processor.batch_decode(labels_ids, skip_special_tokens=True)
    
    # Compute CER
    cer = np.mean([compute_cer(pred, label) for pred, label in zip(pred_str, labels_str)])
    
    return {"cer": cer}


# ==================== MAIN TRAINING ====================

if __name__ == "__main__":
    print("\n📦 Loading processor and model...")
    processor = TrOCRProcessor.from_pretrained(BASE_MODEL)
    model = VisionEncoderDecoderModel.from_pretrained(BASE_MODEL)
    
    # Set model configs
    model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
    model.config.pad_token_id = processor.tokenizer.pad_token_id
    model.config.vocab_size = model.config.decoder.vocab_size
    model.config.eos_token_id = processor.tokenizer.sep_token_id
    model.generation_config.max_length = MAX_LENGTH
    model.generation_config.early_stopping = True
    model.generation_config.no_repeat_ngram_size = 3
    model.generation_config.length_penalty = 2.0
    model.generation_config.num_beams = 4
    
    print(f"✓ Model loaded: {BASE_MODEL}")
    print(f"  Parameters: {model.num_parameters():,}")
    
    # Create datasets
    print("\n[*] Loading datasets...")
    train_dataset = PrescriptionDataset(DATA_DIR, LABELS_DIR, processor, split='train')
    val_dataset = PrescriptionDataset(DATA_DIR, LABELS_DIR, processor, split='val')
    
    print(f"✓ Training samples: {len(train_dataset)}")
    print(f"✓ Validation samples: {len(val_dataset)}")
    
    # Training arguments
    training_args = Seq2SeqTrainingArguments(
        output_dir=str(OUTPUT_DIR),
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        predict_with_generate=True,
        eval_strategy="no",  # Disable evaluation since eval_dataset is removed
        save_strategy="no",
        num_train_epochs=NUM_EPOCHS,
        learning_rate=LEARNING_RATE,
        fp16=device == "cuda",  # Use mixed precision on GPU
        logging_steps=10,
        save_total_limit=2,
        # load_best_model_at_end removed (no evaluation)
        # metric_for_best_model removed (no evaluation)
        # greater_is_better removed (no evaluation)
        report_to="none",  # Disable wandb/tensorboard
    )
    
    # Create trainer
    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        data_collator=default_data_collator,
    )
    
    # Start training
    print("\n🚀 Starting training...")
    print(f"   Epochs: {NUM_EPOCHS}")
    print(f"   Batch size: {BATCH_SIZE}")
    print(f"   Learning rate: {LEARNING_RATE}")
    print("=" * 60)
    
    trainer.train()
    
    # Save final model
    print("\n💾 Saving model...")
    trainer.save_model(str(OUTPUT_DIR))
    processor.save_pretrained(str(OUTPUT_DIR))

    # Ensure pytorch_model.bin exists (in addition to model.safetensors)
    safetensors_path = OUTPUT_DIR / "model.safetensors"
    pt_path = OUTPUT_DIR / "pytorch_model.bin"
    if safetensors_path.exists() and not pt_path.exists():
        # Try to save as PyTorch format if only safetensors exists
        print("[INFO] Only model.safetensors found. Saving PyTorch model as pytorch_model.bin...")
        torch.save(model.state_dict(), pt_path)
        print("[INFO] pytorch_model.bin saved.")

    # Ensure preprocessor_config.json exists (copy/rename if needed)
    proc_cfg = OUTPUT_DIR / "processor_config.json"
    preproc_cfg = OUTPUT_DIR / "preprocessor_config.json"
    if proc_cfg.exists() and not preproc_cfg.exists():
        import shutil
        shutil.copy(proc_cfg, preproc_cfg)
        print("[INFO] preprocessor_config.json created from processor_config.json.")

    # Ensure vocab.json and special_tokens_map.json exist
    tokenizer_dir = OUTPUT_DIR
    vocab_json = tokenizer_dir / "vocab.json"
    special_tokens_map = tokenizer_dir / "special_tokens_map.json"
    # Try to extract from tokenizer if missing
    if not vocab_json.exists() and hasattr(processor.tokenizer, "vocab"):  # For fast tokenizers
        with open(vocab_json, "w", encoding="utf-8") as f:
            json.dump(processor.tokenizer.vocab, f, ensure_ascii=False, indent=2)
        print("[INFO] vocab.json exported from tokenizer.")
    if not special_tokens_map.exists() and hasattr(processor.tokenizer, "special_tokens_map"):  # For fast tokenizers
        with open(special_tokens_map, "w", encoding="utf-8") as f:
            json.dump(processor.tokenizer.special_tokens_map, f, ensure_ascii=False, indent=2)
        print("[INFO] special_tokens_map.json exported from tokenizer.")

    print(f"\n[✓] Training complete!")
    print(f"   Model saved to: {OUTPUT_DIR}")
    print("\n[>>] Next steps:")
    print("   1. Test the model: python test_accuracy.py")
    print("   2. Backend will automatically use this model")
    print("   3. Check backend/src/services/customOcrService.ts")
