"""
Fast Line-Level TrOCR Training Script
======================================
Key speed optimizations over train_improved.py:
  - Trains on single text lines (not full documents)
  - Freezes encoder (ViT) — only trains decoder (~60% fewer trainable params)
  - Batch size 8 (line images are small)
  - MAX_LENGTH 64 instead of 512 (lines are short)
  - 2 epochs (lines are simpler, converge fast)
  - fp16 for GPU acceleration
"""

import os
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
    default_data_collator,
)

# ==================== CONFIGURATION ====================

DATA_DIR = Path(__file__).parent.parent / "training_data"
LABELS_DIR = DATA_DIR / "labels"
OUTPUT_DIR = Path(__file__).parent.parent / "model"

BASE_MODEL = "microsoft/trocr-base-printed"
MAX_LENGTH = 64          # Lines are short — 64 tokens is plenty (was 512)
BATCH_SIZE = 8           # Line images are small — fit more per batch (was 2)
NUM_EPOCHS = 2           # Lines are simpler — converge in 2 epochs (was 3)
LEARNING_RATE = 5e-5
WARMUP_STEPS = 100
WEIGHT_DECAY = 0.01
FREEZE_ENCODER = True    # Only train decoder — massive speedup

device = "cuda" if torch.cuda.is_available() else "cpu"

print("=" * 70)
print("LINE-LEVEL TrOCR TRAINING (FAST)")
print("=" * 70)
print(f"[*] Device:          {device}")
print(f"[*] Epochs:          {NUM_EPOCHS}")
print(f"[*] Batch Size:      {BATCH_SIZE}")
print(f"[*] Max Length:       {MAX_LENGTH} tokens")
print(f"[*] Learning Rate:   {LEARNING_RATE}")
print(f"[*] Freeze Encoder:  {FREEZE_ENCODER}")
print(f"[*] Data Dir:        {DATA_DIR}")
print(f"[*] Output Dir:      {OUTPUT_DIR}")
print("=" * 70)


# ==================== AUGMENTATION ====================

def augment_image(image):
    """Light augmentation for line images"""
    if random.random() > 0.5:
        return image
    if random.random() > 0.5:
        image = ImageEnhance.Brightness(image).enhance(random.uniform(0.85, 1.15))
    if random.random() > 0.5:
        image = ImageEnhance.Contrast(image).enhance(random.uniform(0.85, 1.15))
    return image


# ==================== DATASET ====================

class LineDataset(Dataset):
    def __init__(self, image_files, labels, processor, max_length, is_train=True):
        self.image_files = image_files
        self.labels = labels
        self.processor = processor
        self.max_length = max_length
        self.is_train = is_train

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        image = Image.open(self.image_files[idx]).convert("RGB")
        if self.is_train:
            image = augment_image(image)

        pixel_values = self.processor(image, return_tensors="pt").pixel_values.squeeze()

        labels = self.processor.tokenizer(
            self.labels[idx],
            padding="max_length",
            max_length=self.max_length,
            truncation=True,
            return_tensors="pt",
        ).input_ids.squeeze()

        labels[labels == self.processor.tokenizer.pad_token_id] = -100

        return {"pixel_values": pixel_values, "labels": labels}


# ==================== MAIN ====================

def main():
    # 1. Load data
    print("\n[1/6] Loading dataset...")
    image_files = sorted(list(DATA_DIR.glob("line_*.png")))
    if not image_files:
        print("[ERROR] No line images found. Run generate_line_data.py first!")
        return

    labels = []
    for img_file in image_files:
        label_file = LABELS_DIR / f"{img_file.stem}.txt"
        if label_file.exists():
            labels.append(label_file.read_text(encoding="utf-8").strip())
        else:
            labels.append("")

    print(f"[OK] Found {len(image_files)} line images")

    # 2. Load model
    print("\n[2/6] Loading base model...")
    processor = TrOCRProcessor.from_pretrained(BASE_MODEL)
    model = VisionEncoderDecoderModel.from_pretrained(BASE_MODEL)

    model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
    model.config.pad_token_id = processor.tokenizer.pad_token_id
    model.config.vocab_size = model.config.decoder.vocab_size

    # Freeze encoder for speed
    if FREEZE_ENCODER:
        for param in model.encoder.parameters():
            param.requires_grad = False
        trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
        total = sum(p.numel() for p in model.parameters())
        print(f"[OK] Encoder frozen: {trainable:,} trainable / {total:,} total params ({100*trainable/total:.1f}%)")
    else:
        total = sum(p.numel() for p in model.parameters())
        print(f"[OK] All parameters trainable: {total:,}")

    model.to(device)

    # 3. Split train/val
    print("\n[3/6] Splitting dataset...")
    indices = list(range(len(image_files)))
    random.seed(42)
    random.shuffle(indices)
    split = int(0.9 * len(indices))  # 90/10 split for lines (more training data)

    train_files = [image_files[i] for i in indices[:split]]
    train_labels = [labels[i] for i in indices[:split]]
    val_files = [image_files[i] for i in indices[split:]]
    val_labels = [labels[i] for i in indices[split:]]

    train_dataset = LineDataset(train_files, train_labels, processor, MAX_LENGTH, is_train=True)
    val_dataset = LineDataset(val_files, val_labels, processor, MAX_LENGTH, is_train=False)

    print(f"[OK] Training samples:   {len(train_dataset)}")
    print(f"[OK] Validation samples: {len(val_dataset)}")

    # 4. Configure training
    print("\n[4/6] Configuring training...")
    training_args = Seq2SeqTrainingArguments(
        output_dir=str(OUTPUT_DIR),
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        learning_rate=LEARNING_RATE,
        weight_decay=WEIGHT_DECAY,
        warmup_steps=WARMUP_STEPS,
        logging_steps=50,
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=2,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        fp16=(device == "cuda"),
        report_to="none",
        remove_unused_columns=False,
        dataloader_num_workers=0,  # Windows compatibility
    )
    print("[OK] Training configured")

    # 5. Train
    print("\n[5/6] Creating trainer and starting training...")
    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        data_collator=default_data_collator,
    )

    print("=" * 70)
    print("TRAINING IN PROGRESS")
    print("=" * 70)

    trainer.train()

    print("\n" + "=" * 70)
    print("TRAINING COMPLETED!")
    print("=" * 70)

    # 6. Save
    print("\n[6/6] Saving model...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(OUTPUT_DIR))
    processor.save_pretrained(str(OUTPUT_DIR))

    # Verify
    saved_files = sorted(OUTPUT_DIR.glob("*"))
    print(f"[OK] Saved {len(saved_files)} files to {OUTPUT_DIR}:")
    for f in saved_files:
        if f.is_file():
            size_mb = f.stat().st_size / (1024 * 1024)
            print(f"     {f.name:35s} ({size_mb:>8.2f} MB)")

    print("\n" + "=" * 70)
    print("SUCCESS! Line-level model training complete.")
    print("=" * 70)


if __name__ == "__main__":
    main()
