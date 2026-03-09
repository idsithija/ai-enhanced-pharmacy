"""
IMPROVED Training Script for Custom TrOCR Model
===============================================
Fixes overfitting issues with:
- Reduced epochs (3 instead of 5)
- Data augmentation
- Validation monitoring
- Better model saving
"""

import os
import json
import torch
from PIL import Image, ImageEnhance
import random
from pathlib import Path
from torch.utils.data import Dataset
from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    default_data_collator
)
import numpy as np

# ==================== CONFIGURATION ====================

DATA_DIR = Path(__file__).parent.parent / "data"
LABELS_DIR = DATA_DIR / "labels"
OUTPUT_DIR = Path(__file__).parent.parent / "model"

# IMPROVED PARAMETERS TO PREVENT OVERFITTING
BASE_MODEL = "microsoft/trocr-base-printed"
MAX_LENGTH = 512  # Increased for longer prescriptions
BATCH_SIZE = 2
NUM_EPOCHS = 3  # REDUCED from 5 to prevent overfitting
LEARNING_RATE = 5e-5
WARMUP_STEPS = 50
WEIGHT_DECAY = 0.01  # Add weight decay for regularization

# Data augmentation settings
USE_AUGMENTATION = True
AUG_BRIGHTNESS_RANGE = (0.8, 1.2)
AUG_CONTRAST_RANGE = (0.8, 1.2)
AUG_PROBABILITY = 0.5  # 50% chance to augment each image

device = "cuda" if torch.cuda.is_available() else "cpu"

print("=" * 70)
print("IMPROVED PRESCRIPTION OCR MODEL TRAINING")
print("=" * 70)
print(f"[*] Device: {device}")
print(f"[*] Epochs: {NUM_EPOCHS} (reduced to prevent overfitting)")
print(f"[*] Batch Size: {BATCH_SIZE}")
print(f"[*] Learning Rate: {LEARNING_RATE}")
print(f"[*] Data Augmentation: {'ENABLED' if USE_AUGMENTATION else 'DISABLED'}")
print(f"[*] Output: {OUTPUT_DIR}")
print("=" * 70)

# ==================== DATA AUGMENTATION ====================

def augment_image(image, probability=AUG_PROBABILITY):
    """Apply random data augmentation to reduce overfitting"""
    if not USE_AUGMENTATION or random.random() > probability:
        return image
    
    # Random brightness
    if random.random() > 0.5:
        factor = random.uniform(*AUG_BRIGHTNESS_RANGE)
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(factor)
    
    # Random contrast
    if random.random() > 0.5:
        factor = random.uniform(*AUG_CONTRAST_RANGE)
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(factor)
    
    return image

# ==================== DATASET CLASS ====================

class PrescriptionDataset(Dataset):
    def __init__(self, data_dir, labels_dir, processor, max_length=512, is_train=True):
        self.data_dir = Path(data_dir)
        self.labels_dir = Path(labels_dir)
        self.processor = processor
        self.max_length = max_length
        self.is_train = is_train
        
        # Get all image files
        self.image_files = sorted(list(self.data_dir.glob("prescription_*.png")))
        
        # Load corresponding labels
        self.labels = []
        for img_file in self.image_files:
            # Extract ID from filename (e.g., prescription_0001_medium.png -> prescription_0001)
            img_id = img_file.stem.split('_')[0] + '_' + img_file.stem.split('_')[1]
            label_file = self.labels_dir / f"{img_id}.txt"
            
            if label_file.exists():
                with open(label_file, 'r', encoding='utf-8') as f:
                    label_text = f.read().strip()
                self.labels.append(label_text)
            else:
                print(f"[!] Warning: No label found for {img_file.name}")
                self.labels.append("")
        
        print(f"[*] Loaded {len(self.image_files)} images")
    
    def __len__(self):
        return len(self.image_files)
    
    def __getitem__(self, idx):
        # Load image
        image = Image.open(self.image_files[idx]).convert("RGB")
        
        # Apply augmentation only during training
        if self.is_train:
            image = augment_image(image)
        
        # Process image
        pixel_values = self.processor(image, return_tensors="pt").pixel_values.squeeze()
        
        # Process label
        labels = self.processor.tokenizer(
            self.labels[idx],
            padding="max_length",
            max_length=self.max_length,
            truncation=True,
            return_tensors="pt"
        ).input_ids.squeeze()
        
        # Replace padding token id with -100 (ignored in loss)
        labels[labels == self.processor.tokenizer.pad_token_id] = -100
        
        return {
            "pixel_values": pixel_values,
            "labels": labels
        }

# ==================== MAIN TRAINING ====================

def main():
    print("\n[1/6] Loading base model and processor...")
    processor = TrOCRProcessor.from_pretrained(BASE_MODEL)
    model = VisionEncoderDecoderModel.from_pretrained(BASE_MODEL)
    
    # Set decoder start token
    model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
    model.config.pad_token_id = processor.tokenizer.pad_token_id
    model.config.vocab_size = model.config.decoder.vocab_size
    
    # Move to device
    model.to(device)
    print(f"[OK] Model loaded: {BASE_MODEL}")
    print(f"[OK] Parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    print("\n[2/6] Loading dataset...")
    full_dataset = PrescriptionDataset(DATA_DIR, LABELS_DIR, processor, MAX_LENGTH, is_train=True)
    
    # Split into train/val (80/20)
    total_size = len(full_dataset)
    train_size = int(0.8 * total_size)
    val_size = total_size - train_size
    
    train_dataset, val_dataset = torch.utils.data.random_split(
        full_dataset, 
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )
    
    # Mark validation dataset as non-training (no augmentation)
    val_dataset.dataset.is_train = False
    
    print(f"[OK] Training samples: {train_size}")
    print(f"[OK] Validation samples: {val_size}")
    
    print("\n[3/6] Configuring training parameters...")
    training_args = Seq2SeqTrainingArguments(
        output_dir=str(OUTPUT_DIR),
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        learning_rate=LEARNING_RATE,
        weight_decay=WEIGHT_DECAY,
        warmup_steps=WARMUP_STEPS,
        logging_steps=10,
        eval_strategy="epoch",  # Evaluate every epoch
        save_strategy="epoch",  # Save every epoch
        save_total_limit=2,  # Keep only best 2 models
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        fp16=device == "cuda",
        report_to="none",
        remove_unused_columns=False,
    )
    
    print("[OK] Training configuration set")
    print(f"     - Epochs: {NUM_EPOCHS}")
    print(f"     - Batch size: {BATCH_SIZE}")
    print(f"     - Learning rate: {LEARNING_RATE}")
    print(f"     - Weight decay: {WEIGHT_DECAY}")
    print(f"     - Warmup steps: {WARMUP_STEPS}")
    
    print("\n[4/6] Creating trainer...")
    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        data_collator=default_data_collator,
    )
    print("[OK] Trainer created")
    
    print("\n[5/6] Starting training...")
    print("=" * 70)
    print("TRAINING IN PROGRESS")
    print("=" * 70)
    
    trainer.train()
    
    print("\n" + "=" * 70)
    print("TRAINING COMPLETED!")
    print("=" * 70)
    
    print("\n[6/6] Saving final model...")
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save model and processor
    trainer.save_model(str(OUTPUT_DIR))
    processor.save_pretrained(str(OUTPUT_DIR))
    
    # Verify saves
    print("\n[*] Verifying saved files...")
    saved_files = list(OUTPUT_DIR.glob("*"))
    print(f"[OK] Found {len(saved_files)} files in {OUTPUT_DIR}:")
    for f in sorted(saved_files):
        if f.is_file():
            size_mb = f.stat().st_size / (1024 * 1024)
            print(f"     - {f.name:30s} ({size_mb:>8.2f} MB)")
    
    # Check critical files
    critical_files = ["config.json", "pytorch_model.bin", "preprocessor_config.json"]
    missing = [f for f in critical_files if not (OUTPUT_DIR / f).exists()]
    
    if missing:
        print(f"\n[!] WARNING: Missing files: {missing}")
        # Try alternative names
        if "pytorch_model.bin" in missing and (OUTPUT_DIR / "model.safetensors").exists():
            print("[*] Found model.safetensors instead, converting...")
            torch.save(model.state_dict(), OUTPUT_DIR / "pytorch_model.bin")
            print("[OK] Saved pytorch_model.bin")
    else:
        print("\n[OK] All critical files present!")
    
    print("\n" + "=" * 70)
    print("SUCCESS! Model training complete and saved.")
    print("=" * 70)
    print(f"\nModel Location: {OUTPUT_DIR.absolute()}")
    print("\nNext steps:")
    print("1. Test the model with training images")
    print("2. Test with new images to verify no overfitting")
    print("3. Start the API service to use the model")
    print("=" * 70)

if __name__ == "__main__":
    main()
