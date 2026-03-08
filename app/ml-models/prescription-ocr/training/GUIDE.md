# 🎓 Complete Training Guide

Step-by-step guide to train your custom prescription OCR model.

## 📋 Prerequisites

### 1. Python Environment
```powershell
python --version  # Should be 3.8+
```

### 2. Install Dependencies
```powershell
cd ml-models/prescription-ocr/training
pip install -r requirements.txt
```

**Note**: This will download ~5GB of PyTorch and Transformers. Takes 10-30 minutes.

### 3. GPU Access (Recommended)

**Option A: Google Colab (FREE)** ⭐
- Visit https://colab.research.google.com
- Runtime → Change runtime type → GPU (T4)
- Upload training files and data
- **Free tier is sufficient for this project**

**Option B: Local GPU**
- Requires NVIDIA GPU with CUDA
- Much faster than CPU (30-60 min vs 8-12 hours)

**Option C: CPU** (Not recommended)
- Training will take 8-12 hours
- Only for small datasets

## 🚀 Training Steps

### Step 1: Generate Training Data

```powershell
# From ml-models/prescription-ocr/training/
python generate_data.py
```

This generates 100 synthetic prescription images in `backend/scripts/synthetic_prescriptions/`

**Want more data?** Edit `backend/scripts/generate_prescriptions.py`:
```python
NUM_PRESCRIPTIONS = 500  # Increase for better accuracy
```

### Step 2: Train the Model

```powershell
python train.py
```

**What happens:**
1. Loads microsoft/trocr-base-printed (pre-trained model)
2. Splits data 80/20 (train/validation)
3. Trains for 5 epochs
4. Saves best model based on validation CER

**Expected output:**
```
Epoch 1/5
  Training Loss: 2.45
  Validation Loss: 2.12
  CER: 0.25 (25% error)

Epoch 2/5
  Training Loss: 1.82
  Validation Loss: 1.65
  CER: 0.18 (18% error)

...

Epoch 5/5
  Training Loss: 0.94
  Validation Loss: 1.12
  CER: 0.11 (11% error = 89% accuracy!)
```

**Training time:**
- GPU (Google Colab T4): 30-60 minutes
- GPU (RTX 3060): 20-40 minutes  
- CPU: 8-12 hours ⚠️

### Step 3: Test Accuracy

```powershell
python test_accuracy.py
```

**Output:**
```
📊 TEST RESULTS
============================================================
Character Accuracy: 88.45%
Word Accuracy: 92.30%
Character Error Rate (CER): 0.1155
Tested Images: 20
============================================================
```

Shows sample predictions and saves detailed results to `test_results.json`

### Step 4: Use in Backend

The model is automatically ready to use! The backend OCR service will detect it:

```typescript
// backend/src/services/customOcrService.ts
// Automatically loads from ml-models/prescription-ocr/model/
```

## 📊 Expected Results

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| Character Accuracy | >75% | >85% | >90% |
| Word Accuracy | >85% | >90% | >95% |
| Training Time (GPU) | <60 min | <45 min | <30 min |

## 🔧 Troubleshooting

### CUDA Out of Memory
```
RuntimeError: CUDA out of memory
```

**Solution**: Reduce batch size in `train.py`:
```python
BATCH_SIZE = 2  # Default is 4
```

### Poor Accuracy (<75%)
1. **Generate more data**: Increase to 500-1000 images
2. **Train longer**: Increase epochs to 10
3. **Use larger model**: Change to `microsoft/trocr-large-printed`
4. **Check data quality**: Ensure labels are accurate

### Training Too Slow
- Use Google Colab with free GPU
- Reduce dataset size for testing (50 images)
- Use smaller model: `microsoft/trocr-small-printed`

### Model Not Found in Backend
- Check model saved to: `ml-models/prescription-ocr/model/`
- Ensure files exist: `config.json`, `pytorch_model.bin`
- Run `python train.py` again if files missing

## 🎯 Advanced Configuration

### Change Base Model

In `train.py`:
```python
# For handwritten prescriptions
BASE_MODEL = "microsoft/trocr-base-handwritten"

# For better accuracy (larger model)
BASE_MODEL = "microsoft/trocr-large-printed"

# For faster training (smaller model)
BASE_MODEL = "microsoft/trocr-small-printed"
```

### Adjust Training Parameters

```python
NUM_EPOCHS = 10        # More epochs = better accuracy (but risk overfitting)
LEARNING_RATE = 3e-5   # Lower = more stable, Higher = faster convergence
BATCH_SIZE = 8         # Larger = faster (but needs more memory)
MAX_LENGTH = 512       # For longer prescriptions
```

### Use Your Own Images

1. Place images in `data/images/`
2. Create labels in `data/labels/` (same filename + .txt)
3. Update `train.py`:
```python
DATA_DIR = Path("data/images")
LABELS_DIR = Path("data/labels")
```

## 📚 Google Colab Setup

### Upload to Colab

1. Create new notebook at https://colab.research.google.com
2. Upload files:
   - `train.py`
   - `requirements.txt`
   - `backend/scripts/synthetic_prescriptions/` (entire folder)

3. Run cells:
```python
# Cell 1: Install dependencies
!pip install -r requirements.txt

# Cell 2: Train
!python train.py

# Cell 3: Test
!python test_accuracy.py
```

4. Download trained model:
```python
# Cell 4: Download model
from google.colab import files
!zip -r model.zip model/
files.download('model.zip')
```

5. Extract to `ml-models/prescription-ocr/model/` in your project

## 🎓 Understanding the Output

### Model Files
```
model/
├── config.json              # Model architecture config
├── pytorch_model.bin        # Trained weights (~1GB)
├── preprocessor_config.json # Image preprocessing
├── tokenizer_config.json    # Text tokenizer
├── vocab.json              # Vocabulary
└── special_tokens_map.json  # Special tokens
```

### Training Logs
- **Training Loss**: Should decrease each epoch
- **Validation Loss**: Should decrease or stay flat (not increase!)
- **CER**: Character Error Rate - lower is better (<0.15 is good)

### Good Training vs Overfitting

**Good Training:**
```
Epoch 1: Train Loss 2.45, Val Loss 2.12
Epoch 2: Train Loss 1.82, Val Loss 1.65
Epoch 3: Train Loss 1.34, Val Loss 1.28
Epoch 4: Train Loss 1.12, Val Loss 1.15
Epoch 5: Train Loss 0.94, Val Loss 1.12
```
✅ Both decreasing, small gap

**Overfitting:**
```
Epoch 1: Train Loss 2.45, Val Loss 2.12
Epoch 2: Train Loss 1.82, Val Loss 1.65
Epoch 3: Train Loss 0.95, Val Loss 1.85
Epoch 4: Train Loss 0.45, Val Loss 2.15
Epoch 5: Train Loss 0.12, Val Loss 2.45
```
❌ Train decreases but Val increases = model memorizing training data

**Solution for overfitting:**
- Generate more diverse training data
- Reduce number of epochs
- Add data augmentation
- Use early stopping (already enabled)

## 🚀 Next Steps

After successful training:

1. ✅ Model saved to `ml-models/prescription-ocr/model/`
2. ✅ Backend will auto-detect and use custom model
3. ✅ Test in UI by uploading prescription image
4. ✅ Compare results with baseline Tesseract

Enjoy your custom-trained OCR model! 🎉
