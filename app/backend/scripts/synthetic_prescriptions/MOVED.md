# ⚠️ Data Location Moved

**The synthetic prescriptions data has been moved to:**

```
ml-models/prescription-ocr/data/
```

This directory (`backend/scripts/synthetic_prescriptions/`) is now **deprecated** and kept only for reference.

## 🔄 New Workflow

### Generate Data
```powershell
# From ml-models/prescription-ocr/training/
python generate_data.py
```

This will generate data directly in `ml-models/prescription-ocr/data/`

### Or Generate Manually
```powershell
# From backend/scripts/
python generate_prescriptions.py
# Then copy to: ml-models/prescription-ocr/data/
```

## 📁 Why the Move?

The data belongs with the ML infrastructure:

**Old Location (deprecated):**
```
backend/scripts/synthetic_prescriptions/  ❌
```

**New Location (correct):**
```
ml-models/prescription-ocr/data/  ✅
```

This keeps all ML-related files together:
- Training scripts
- Training data
- Trained models
- Documentation

## 🗑️ Can I Delete This?

Yes! After confirming the data exists in `ml-models/prescription-ocr/data/`:

```powershell
# Check new location has data
ls ml-models\prescription-ocr\data\*.png

# If yes, delete old location
rm -r backend\scripts\synthetic_prescriptions
```

## 📝 Updated Scripts

All training scripts now reference the new location:
- `ml-models/prescription-ocr/training/train.py`
- `ml-models/prescription-ocr/training/test_accuracy.py`
- `ml-models/prescription-ocr/training/generate_data.py`

No changes needed - they automatically use the new path!
