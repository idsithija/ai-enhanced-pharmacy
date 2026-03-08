"""
Custom OCR Model Training with Transfer Learning
Uses TrOCR (Transformer-based OCR) from Hugging Face

This is a moderate-complexity approach suitable for campus projects:
- Uses pre-trained model (Microsoft TrOCR)
- Fine-tunes on your synthetic prescription data
- Can achieve 80-90% accuracy with good training data
"""

import os
import json
import torch
from PIL import Image
from torch.utils.data import Dataset, DataLoader
from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    default_data_collator
)
from datasets import load_metric
import numpy as np

# Configuration
PRESCRIPTIONS_DIR = "synthetic_prescriptions"
LABELS_DIR = "synthetic_prescriptions/labels"
METADATA_FILE = "synthetic_prescriptions/metadata.json"
MODEL_OUTPUT_DIR = "models/custom_ocr"
PRETRAINED_MODEL = "microsoft/trocr-base-printed"  # Pre-trained TrOCR model

# Check if GPU is available
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
if device == "cpu":
    print("⚠️  Warning: No GPU detected. Training will be slow.")
    print("   For faster training, use Google Colab with GPU or AWS/Azure with GPU instances.")
    print()


class PrescriptionDataset(Dataset):
    """Custom dataset for prescription images and text"""
    
    def __init__(self, root_dir, metadata, processor, max_target_length=128):
        self.root_dir = root_dir
        self.metadata = metadata
        self.processor = processor
        self.max_target_length = max_target_length
    
    def __len__(self):
        return len(self.metadata)
    
    def __getitem__(self, idx):
        item = self.metadata[idx]
        
        # Load image
        image_path = os.path.join(self.root_dir, item['filename'])
        image = Image.open(image_path).convert("RGB")
        
        # Get ground truth text
        text = item['ground_truth']
        
        # Process image
        pixel_values = self.processor(image, return_tensors="pt").pixel_values
        
        # Process text
        labels = self.processor.tokenizer(
            text,
            padding="max_length",
            max_length=self.max_target_length,
            truncation=True,
            return_tensors="pt"
        ).input_ids
        
        # Replace padding token id with -100 (ignored in loss)
        labels[labels == self.processor.tokenizer.pad_token_id] = -100
        
        return {
            "pixel_values": pixel_values.squeeze(),
            "labels": labels.squeeze()
        }


def compute_cer(pred_str, label_str):
    """Compute Character Error Rate"""
    import editdistance
    return editdistance.eval(pred_str, label_str) / max(len(label_str), 1)


def compute_metrics(pred):
    """Compute evaluation metrics"""
    labels_ids = pred.label_ids
    pred_ids = pred.predictions
    
    # Decode predictions and labels
    processor = TrOCRProcessor.from_pretrained(PRETRAINED_MODEL)
    
    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    labels_ids[labels_ids == -100] = processor.tokenizer.pad_token_id
    label_str = processor.batch_decode(labels_ids, skip_special_tokens=True)
    
    # Compute CER
    cer = np.mean([compute_cer(pred, label) for pred, label in zip(pred_str, label_str)])
    
    return {"cer": cer}


class CustomOCRTrainer:
    """Trainer for custom OCR model"""
    
    def __init__(self):
        self.processor = None
        self.model = None
        self.train_dataset = None
        self.eval_dataset = None
    
    def load_data(self):
        """Load and prepare training data"""
        print("=" * 70)
        print("  Loading Training Data")
        print("=" * 70)
        print()
        
        # Load metadata
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        print(f"Found {len(metadata)} prescription images")
        
        # Split into train/eval (80/20)
        train_size = int(0.8 * len(metadata))
        train_metadata = metadata[:train_size]
        eval_metadata = metadata[train_size:]
        
        print(f"  Training set: {len(train_metadata)} images")
        print(f"  Evaluation set: {len(eval_metadata)} images")
        print()
        
        # Load processor
        print("Loading pre-trained processor...")
        self.processor = TrOCRProcessor.from_pretrained(PRETRAINED_MODEL)
        
        # Create datasets
        print("Creating datasets...")
        self.train_dataset = PrescriptionDataset(
            PRESCRIPTIONS_DIR,
            train_metadata,
            self.processor
        )
        self.eval_dataset = PrescriptionDataset(
            PRESCRIPTIONS_DIR,
            eval_metadata,
            self.processor
        )
        
        print("✓ Data loaded successfully!")
        print()
    
    def load_model(self):
        """Load pre-trained model"""
        print("=" * 70)
        print("  Loading Pre-trained Model")
        print("=" * 70)
        print()
        
        print(f"Loading model: {PRETRAINED_MODEL}")
        self.model = VisionEncoderDecoderModel.from_pretrained(PRETRAINED_MODEL)
        self.model.to(device)
        
        # Set special tokens
        self.model.config.decoder_start_token_id = self.processor.tokenizer.cls_token_id
        self.model.config.pad_token_id = self.processor.tokenizer.pad_token_id
        
        # Make sure vocab size is set
        self.model.config.vocab_size = self.model.config.decoder.vocab_size
        
        # Set beam search parameters
        self.model.config.eos_token_id = self.processor.tokenizer.sep_token_id
        self.model.config.max_length = 128
        self.model.config.early_stopping = True
        self.model.config.no_repeat_ngram_size = 3
        self.model.config.length_penalty = 2.0
        self.model.config.num_beams = 4
        
        print("✓ Model loaded successfully!")
        print()
    
    def train(self, epochs=5, batch_size=4):
        """Train the model"""
        print("=" * 70)
        print("  Starting Training")
        print("=" * 70)
        print()
        
        # Create output directory
        os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)
        
        # Training arguments
        training_args = Seq2SeqTrainingArguments(
            output_dir=MODEL_OUTPUT_DIR,
            per_device_train_batch_size=batch_size,
            per_device_eval_batch_size=batch_size,
            predict_with_generate=True,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            logging_steps=50,
            num_train_epochs=epochs,
            learning_rate=5e-5,
            weight_decay=0.01,
            save_total_limit=2,
            load_best_model_at_end=True,
            metric_for_best_model="cer",
            greater_is_better=False,
            fp16=device == "cuda",  # Use mixed precision on GPU
        )
        
        # Initialize trainer
        trainer = Seq2SeqTrainer(
            model=self.model,
            args=training_args,
            train_dataset=self.train_dataset,
            eval_dataset=self.eval_dataset,
            tokenizer=self.processor.feature_extractor,
            data_collator=default_data_collator,
            compute_metrics=compute_metrics,
        )
        
        # Train
        print("Starting training... This may take a while.")
        print()
        trainer.train()
        
        print()
        print("✓ Training complete!")
        print()
        
        # Save final model
        print("Saving model...")
        trainer.save_model(MODEL_OUTPUT_DIR)
        self.processor.save_pretrained(MODEL_OUTPUT_DIR)
        
        print(f"✓ Model saved to: {MODEL_OUTPUT_DIR}")
        print()
    
    def test_inference(self):
        """Test the trained model on a sample image"""
        print("=" * 70)
        print("  Testing Trained Model")
        print("=" * 70)
        print()
        
        # Load a test image
        test_image_path = os.path.join(PRESCRIPTIONS_DIR, "prescription_0001_high.png")
        if not os.path.exists(test_image_path):
            test_image_path = os.path.join(PRESCRIPTIONS_DIR, 
                                          os.listdir(PRESCRIPTIONS_DIR)[0])
        
        image = Image.open(test_image_path).convert("RGB")
        
        # Generate prediction
        pixel_values = self.processor(image, return_tensors="pt").pixel_values.to(device)
        generated_ids = self.model.generate(pixel_values)
        generated_text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        print(f"Test image: {os.path.basename(test_image_path)}")
        print(f"Predicted text:")
        print("-" * 70)
        print(generated_text)
        print("-" * 70)
        print()


def main():
    """Main training pipeline"""
    print()
    print("╔" + "=" * 68 + "╗")
    print("║" + " " * 15 + "Custom OCR Model Training with TrOCR" + " " * 17 + "║")
    print("╚" + "=" * 68 + "╝")
    print()
    
    try:
        # Check dependencies
        print("Checking dependencies...")
        import transformers
        import datasets
        import editdistance
        print("✓ All dependencies installed")
        print()
    except ImportError as e:
        print("❌ Missing dependencies!")
        print()
        print("Please install:")
        print("  pip install transformers datasets torch torchvision editdistance")
        print("  pip install accelerate  # For faster training")
        print()
        return
    
    # Initialize trainer
    trainer = CustomOCRTrainer()
    
    # Load data
    trainer.load_data()
    
    # Load model
    trainer.load_model()
    
    # Ask user for training parameters
    print("=" * 70)
    print("  Training Configuration")
    print("=" * 70)
    print()
    print("Recommended settings:")
    print("  • Epochs: 3-5 (more epochs = better but slower)")
    print("  • Batch size: 2-4 (lower if you get memory errors)")
    print()
    
    try:
        epochs = int(input("Number of epochs [5]: ") or "5")
        batch_size = int(input("Batch size [4]: ") or "4")
    except (ValueError, EOFError):
        epochs = 5
        batch_size = 4
    
    print()
    
    # Train
    trainer.train(epochs=epochs, batch_size=batch_size)
    
    # Test
    trainer.test_inference()
    
    print("=" * 70)
    print("  Training Complete!")
    print("=" * 70)
    print()
    print(f"Model saved to: {MODEL_OUTPUT_DIR}")
    print()
    print("To use the model in your application:")
    print("  1. Load with: VisionEncoderDecoderModel.from_pretrained(MODEL_OUTPUT_DIR)")
    print("  2. Replace Tesseract.js calls with this model")
    print("  3. Deploy model with your backend")
    print()
    print("Next steps:")
    print("  • Test on more images")
    print("  • Compare accuracy with baseline Tesseract")
    print("  • Integrate into your backend OCR service")
    print()


if __name__ == "__main__":
    main()
