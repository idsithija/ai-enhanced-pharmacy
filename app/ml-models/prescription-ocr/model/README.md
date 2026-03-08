# ML Models - Placeholder

This directory will contain your trained models.

## Current Status

🔄 No models trained yet

## Getting Started

To train the prescription OCR model:

```powershell
cd ml-models/prescription-ocr/training
pip install -r requirements.txt
python generate_data.py
python train.py
```

Once trained, the model files will appear here:
- `config.json`
- `pytorch_model.bin`
- `preprocessor_config.json`
- And other model files

The backend will automatically detect and use the model when available.

## Model Structure

After training, this directory should contain:

```
model/
├── config.json              # Model configuration
├── pytorch_model.bin        # Trained weights (~1GB)
├── preprocessor_config.json # Image preprocessing settings
├── tokenizer_config.json    # Text tokenizer config
├── vocab.json              # Vocabulary
└── special_tokens_map.json  # Special tokens
```

## Fallback Behavior

If this folder is empty or model files are missing:
- ✅ Backend automatically uses Tesseract.js (baseline OCR)
- ✅ No errors or crashes
- ℹ️  Log message: "Custom model not found. Using Tesseract fallback."

## Training Quick Reference

| Step | Command | Time |
|------|---------|------|
| Generate data | `python generate_data.py` | 2 min |
| Train model | `python train.py` | 30-60 min (GPU) |
| Test accuracy | `python test_accuracy.py` | 5 min |

Full guide: See `../training/GUIDE.md`
