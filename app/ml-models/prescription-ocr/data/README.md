# Training Data - Synthetic Prescriptions

This directory contains synthetic prescription images used for training the custom OCR model.

## 📊 Current Data

**Total Prescriptions:** 100 images  
**Generated:** March 8, 2026  
**Quality Distribution:**
- High quality: 50 images (50%)
- Medium quality: 30 images (30%)
- Low quality: 20 images (20%)

## 📁 Structure

```
data/
├── metadata.json              # Complete prescription data in JSON
├── prescription_0001_high.png  # High-quality prescription image
├── prescription_0002_low.png   # Low-quality (noisy/rotated)
├── prescription_0003_high.png
├── ...
├── labels/                    # Ground truth text files
│   ├── prescription_0001.txt
│   ├── prescription_0002.txt
│   └── ...
└── ocr_results/              # OCR testing results (optional)
    └── accuracy_results.json
```

## 🎨 Data Characteristics

### Image Properties
- **Size:** 800x1000 pixels
- **Format:** PNG
- **Background:** White
- **Text:** Black (with realistic variations)

### Quality Levels

**High Quality (50%):**
- Clear, sharp text
- No noise or rotation
- Perfect for training baseline accuracy

**Medium Quality (30%):**
- Slight blur (Gaussian blur radius 1-2)
- Minor noise
- Small rotation (±2-5 degrees)
- Simulates standard scanned documents

**Low Quality (20%):**
- Significant blur (radius 3-5)
- High noise levels
- Large rotation (±5-10 degrees)
- Simulates poor quality scans/photos

## 📋 Content

Each prescription contains:

### Patient Information
- **Names:** Sri Lankan names (John Silva, Maria Perera, Kasun Fernando, etc.)
- **Age:** 18-80 years
- **Date:** Random dates within last 30 days

### Medical Information
- **Doctor:** Dr. A. Fernando, Dr. K. Perera, etc.
- **Hospital:** Lanka Hospital, Nawaloka Hospital, Asiri Medical Center, etc.
- **Medicines:** 1-5 medications per prescription

### Medications Include
- Paracetamol (500mg, 650mg)
- Amoxicillin (250mg, 500mg)
- Omeprazole (20mg, 40mg)
- Metformin (500mg, 1000mg)
- Amlodipine (5mg, 10mg)
- Atorvastatin (10mg, 20mg, 40mg)
- And more...

### Dosage Patterns
- **Frequency:** 1-0-1, 1-1-1, Twice daily, Three times daily
- **Duration:** 5 days, 7 days, 14 days, 1 month, 3 months
- **Forms:** Tablet, Capsule, Syrup

## 🔄 Regenerating Data

To generate fresh data or increase the dataset size:

```powershell
# From ml-models/prescription-ocr/training/
python generate_data.py
```

To generate more images, edit `backend/scripts/generate_prescriptions.py`:

```python
NUM_PRESCRIPTIONS = 500  # Increase from 100 to 500
```

## 📊 Usage in Training

This data is used by:

1. **train.py** - Splits into 80/20 train/validation
   - Training set: 80 images
   - Validation set: 20 images

2. **test_accuracy.py** - Uses validation set for testing

3. **Training Results:**
   - Expected accuracy on this data: 85-92%
   - Character Error Rate (CER): < 0.15

## 🎯 Data Quality Guidelines

For best training results:

**Minimum Recommended:**
- 100 images (current)
- Basic quality variation

**Good:**
- 200-500 images
- Diverse quality levels
- Varied prescription formats

**Excellent:**
- 500-1000+ images
- Real prescription images (if available)
- Multiple handwriting styles
- Various scan qualities

## ⚠️ Important Notes

1. **Synthetic Data:** This is computer-generated data for training and testing
2. **No Real Patient Information:** All names, dates, and medical info are fictional
3. **Sri Lankan Context:** Names and hospitals reflect Sri Lankan pharmacy practice
4. **Privacy Safe:** Can be shared and version controlled without privacy concerns

## 📝 Adding Real Data (Optional)

If you have real prescription images:

1. Place images in this directory: `prescription_real_0001.png`
2. Create corresponding labels: `labels/prescription_real_0001.txt`
3. Update metadata.json with ground truth
4. Training scripts will automatically include them

**Remember:** Real prescriptions may contain sensitive patient information!

## 🔍 Inspecting the Data

### View metadata
```powershell
cat metadata.json | ConvertFrom-Json | Select-Object -First 1
```

### Check labels
```powershell
cat labels/prescription_0001.txt
```

### View image count
```powershell
(ls *.png).Count
```

## 📈 Training Performance

With this dataset (100 images):

| Metric | Expected Result |
|--------|----------------|
| Training Time (GPU) | 30-60 minutes |
| Training Time (CPU) | 8-12 hours |
| Character Accuracy | 85-92% |
| Word Accuracy | 90-95% |
| Medicine Extraction | 90-95% |

Tested on: Google Colab T4 GPU
