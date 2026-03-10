# 🤖 ML Models Directory

This directory contains custom-trained machine learning models for the pharmacy system.

## 📁 Directory Structure

```
ml-models/
├── prescription-ocr/              # PaddleOCR-based prescription processing
│   ├── api_service.py             # FastAPI service for OCR inference
│   ├── generate_test_prescriptions.py  # Test data generator
│   ├── requirements.txt           # Python dependencies
│   ├── model/                     # Trained model files
│   │   ├── inference/             # Recognition model (rec)
│   │   │   └── *.pdmodel, *.pdiparams
│   │   └── det_inference/         # Detection model (det) — full-page trained
│   │       └── *.pdmodel, *.pdiparams
│   ├── training/                  # Training notebooks
│   │   ├── PaddleOCR_Training_Colab.ipynb          # Line-level rec training
│   │   └── PaddleOCR_FullPage_Training_Colab.ipynb # Full-page det+rec training
│   ├── training_data/             # Generated after training
│   │   └── en_dict.txt            # Character dictionary
│   └── test_prescriptions/        # Test images + ground truth
├── drug-interaction/              # Drug interaction prediction (future)
└── demand-forecasting/            # Inventory demand forecasting (future)
```

## 🚀 Quick Start

### Option A: Full-Page Training (Recommended)

Trains **both Detection + Recognition** on complete prescription images:

```bash
# Open in Google Colab:
# ml-models/prescription-ocr/training/PaddleOCR_FullPage_Training_Colab.ipynb

# After training, download and extract:
# Copy det_inference/ → ml-models/prescription-ocr/model/det_inference/
# Copy inference/     → ml-models/prescription-ocr/model/inference/
# Copy en_dict.txt    → ml-models/prescription-ocr/training_data/en_dict.txt
```

### Option B: Line-Level Training (Recognition Only)

Trains only the recognition model on cropped text lines:

```bash
# Open in Google Colab:
# ml-models/prescription-ocr/training/PaddleOCR_Training_Colab.ipynb
```

### Run the OCR API

```bash
cd ml-models/prescription-ocr
pip install -r requirements.txt
python api_service.py          # Starts FastAPI on 127.0.0.1:8000
```

### 2. Use in Backend

The backend automatically detects if a custom model exists:

```typescript
// Backend will use custom model if available
// Otherwise falls back to Tesseract
const result = await ocrService.processPrescription(imageUrl);
```

## 📊 Model Performance

| Model | Accuracy | Training | Use Case |
|-------|----------|----------|----------|
| **Tesseract (Default)** | 70-85% | None | Baseline fallback |
| **PaddleOCR Pretrained** | 85-92% | None | Good out-of-box |
| **Custom Rec Only** | 88-94% | Line-level notebook | Fine-tuned recognition |
| **Custom Det + Rec (Full-Page)** | 90-95% | Full-page notebook | **Production recommended** |

## 🔧 Integration with Backend

Custom models are loaded via the OCR service:

- **Location**: `backend/src/services/ocrService.ts`
- **Model Path**: `../../../ml-models/prescription-ocr/model/`
- **Fallback**: Automatically uses Tesseract if custom model not found

## 📝 Training Your Own Model

See detailed guides in:
- `prescription-ocr/training/GUIDE.md` - Complete training guide
- `backend/scripts/CUSTOM_MODEL_GUIDE.md` - Backend integration

## 🎯 Supported Models

### Currently Available
- ✅ **Prescription OCR** - Custom TrOCR model for prescription images

### Planned
- 🔄 **Drug Interaction Prediction** - ML model for drug safety
- 🔄 **Demand Forecasting** - Time series model for inventory
- 🔄 **Medicine Classification** - Image classification for pills/tablets

## 🛠️ Development

### Adding a New Model

1. Create new directory: `ml-models/your-model-name/`
2. Add training scripts in `training/`
3. Save trained model in `model/`
4. Create service in backend: `services/yourModelService.ts`
5. Add API endpoint in controller

### Model Requirements

- **Format**: PyTorch (.bin), TensorFlow (.pb), or ONNX (.onnx)
- **Size**: < 500MB (for reasonable deployment)
- **Dependencies**: Listed in `requirements.txt`

## 📦 Deployment

Custom models can be:
- ✅ Committed to Git (if < 100MB)
- ✅ Stored in cloud storage (AWS S3, Google Cloud Storage)
- ✅ Downloaded during deployment script
- ✅ Loaded dynamically from environment variable path

## 🔐 Model Versioning

Use semantic versioning for models:
```
prescription-ocr/
  model/
    v1.0.0/    # Initial model
    v1.1.0/    # Improved accuracy
    v2.0.0/    # Major architecture change
```

Backend loads latest version automatically.
