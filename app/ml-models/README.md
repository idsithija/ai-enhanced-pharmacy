# 🤖 ML Models Directory

This directory contains custom-trained machine learning models for the pharmacy system.

## 📁 Directory Structure

```
ml-models/
├── prescription-ocr/          # Custom OCR model for prescriptions
│   ├── model/                 # Trained model files
│   │   ├── config.json
│   │   ├── pytorch_model.bin
│   │   └── preprocessor_config.json
│   ├── training/              # Training scripts and data
│   │   ├── train.py
│   │   ├── generate_data.py
│   │   └── test_accuracy.py
│   └── README.md
├── drug-interaction/          # Drug interaction prediction model (future)
└── demand-forecasting/        # Inventory demand forecasting (future)
```

## 🚀 Quick Start

### 1. Train Custom OCR Model

```powershell
# Navigate to training directory
cd ml-models/prescription-ocr/training

# Install dependencies
pip install -r requirements.txt

# Generate synthetic training data
python generate_data.py

# Train the model
python train.py

# Test accuracy
python test_accuracy.py
```

### 2. Use in Backend

The backend automatically detects if a custom model exists:

```typescript
// Backend will use custom model if available
// Otherwise falls back to Tesseract
const result = await ocrService.processPrescription(imageUrl);
```

## 📊 Model Performance

| Model | Accuracy | Speed | Use Case |
|-------|----------|-------|----------|
| **Tesseract (Default)** | 70-85% | Fast | Baseline OCR |
| **Custom TrOCR** | 85-92% | Medium | Fine-tuned for medical prescriptions |
| **Custom + Preprocessing** | 90-95% | Medium | Production recommended |

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
