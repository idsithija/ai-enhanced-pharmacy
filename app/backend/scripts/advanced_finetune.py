"""
Advanced: Fine-tune Tesseract OCR on Medical Prescription Data
This script prepares data for Tesseract fine-tuning (advanced users only)

NOTE: This is complex and optional. Most users should just use the
image preprocessing and validation workflow instead.
"""

import os
import json
import subprocess
from pathlib import Path


PRESCRIPTIONS_DIR = "synthetic_prescriptions"
LABELS_DIR = "synthetic_prescriptions/labels"
TRAINING_DIR = "tesseract_training"
METADATA_FILE = "synthetic_prescriptions/metadata.json"


class TesseractFineTuner:
    """
    Prepare training data for Tesseract fine-tuning
    
    WARNING: Full Tesseract training is complex and requires:
    - Tesseract development tools
    - Box file editing
    - Multiple training iterations
    - Several hours of computation
    
    For most campus projects, this is OVERKILL.
    Better to focus on:
    1. Image preprocessing
    2. Post-processing with medical dictionaries
    3. Good pharmacist verification UI
    """
    
    def __init__(self):
        self.training_dir = TRAINING_DIR
        os.makedirs(self.training_dir, exist_ok=True)
        
        print("⚠️  WARNING: Tesseract Fine-tuning Guide")
        print("=" * 70)
        print()
        print("Fine-tuning Tesseract is an ADVANCED process that requires:")
        print("  • Tesseract training tools (separate installation)")
        print("  • Box file creation and editing")
        print("  • Multiple training iterations (hours of computation)")
        print("  • Deep understanding of Tesseract internals")
        print()
        print("For a campus project, this is typically NOT necessary.")
        print()
        print("RECOMMENDED ALTERNATIVES:")
        print("  1. Use pre-trained Tesseract models (already available)")
        print("  2. Add image preprocessing (implemented in ocrService.ts)")
        print("  3. Implement medical term autocorrection")
        print("  4. Build a good pharmacist verification interface")
        print()
        print("=" * 70)
        print()
    
    def prepare_training_data(self):
        """
        Prepare synthetic images for Tesseract training format
        This creates the directory structure needed for training
        """
        print("Preparing training data structure...")
        
        # Create subdirectories
        os.makedirs(os.path.join(self.training_dir, 'images'), exist_ok=True)
        os.makedirs(os.path.join(self.training_dir, 'ground_truth'), exist_ok=True)
        
        # Load metadata
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        print(f"Found {len(metadata)} prescriptions")
        
        # Copy files to training structure
        training_manifest = []
        
        for item in metadata:
            image_src = os.path.join(PRESCRIPTIONS_DIR, item['filename'])
            label_src = os.path.join(LABELS_DIR, item['label_file'])
            
            base_name = f"prescription_{item['id']:04d}"
            
            # Copy to training dir
            image_dst = os.path.join(self.training_dir, 'images', f"{base_name}.png")
            gt_dst = os.path.join(self.training_dir, 'ground_truth', f"{base_name}.gt.txt")
            
            # Would copy files here in actual implementation
            training_manifest.append({
                'id': item['id'],
                'image': image_dst,
                'ground_truth': gt_dst,
                'quality': item['quality']
            })
        
        print(f"✓ Training structure prepared in: {self.training_dir}/")
        return training_manifest
    
    def generate_box_files(self):
        """
        Generate .box files needed for Tesseract training
        
        This is a SIMPLIFIED example. Real implementation requires:
        1. Running tesseract in training mode
        2. Manually correcting box files
        3. Re-running training
        """
        print()
        print("To generate box files (ADVANCED - requires tesseract training tools):")
        print()
        print("# Step 1: Generate initial box files")
        print("tesseract prescription_0001.png prescription_0001 -l eng batch.nochop makebox")
        print()
        print("# Step 2: Manually correct box files using a box editor")
        print("# (e.g., jTessBoxEditor, qtBox)")
        print()
        print("# Step 3: Train custom model")
        print("tesseract prescription_0001.png prescription_0001 nobatch box.train")
        print()
        print("# Step 4: Combine training files and create traineddata")
        print("# (This involves multiple complex steps)")
        print()
    
    def show_alternative_approaches(self):
        """
        Show simpler alternatives that achieve similar results
        """
        print()
        print("=" * 70)
        print("  RECOMMENDED APPROACH FOR CAMPUS PROJECTS")
        print("=" * 70)
        print()
        print("Instead of fine-tuning Tesseract, focus on:")
        print()
        print("1️⃣  IMAGE PREPROCESSING (Best ROI)")
        print("   - Convert to grayscale")
        print("   - Increase contrast using adaptive thresholding")
        print("   - Deskew/rotate images")
        print("   - Resize to optimal DPI (300)")
        print("   - Remove noise")
        print()
        print("2️⃣  POST-PROCESSING CORRECTIONS")
        print("   - Build medical term dictionary from your medicine database")
        print("   - Use fuzzy matching (Levenshtein distance)")
        print("   - Auto-correct common OCR errors:")
        print("     • O → 0 (oh to zero)")
        print("     • l → 1 (el to one)")
        print("     • 5 → S (five to ess)")
        print()
        print("3️⃣  PHARMACIST VERIFICATION UI")
        print("   - Show original image side-by-side with OCR text")
        print("   - Highlight low-confidence words")
        print("   - Provide medicine name autocomplete")
        print("   - Enable quick corrections")
        print()
        print("4️⃣  CONFIDENCE-BASED ROUTING")
        print("   - High confidence (>85%): Auto-approve")
        print("   - Medium (70-85%): Flag for review")
        print("   - Low (<70%): Require manual entry")
        print()
        print("These approaches give you 80% of the benefit with 20% of the effort!")
        print()
    
    def create_medical_dictionary(self):
        """
        Create a medical term dictionary for post-processing
        This is MUCH easier than fine-tuning and very effective
        """
        print("=" * 70)
        print("  Creating Medical Term Dictionary")
        print("=" * 70)
        print()
        
        # In real implementation, this would load from medicine database
        medical_terms = [
            "Paracetamol", "Amoxicillin", "Omeprazole", "Metformin",
            "Amlodipine", "Atorvastatin", "Aspirin", "Cetirizine",
            "Azithromycin", "Prednisolone", "Ibuprofen", "Diclofenac"
        ]
        
        dict_file = os.path.join(self.training_dir, 'medical_dictionary.txt')
        with open(dict_file, 'w', encoding='utf-8') as f:
            for term in sorted(medical_terms):
                f.write(f"{term}\n")
        
        print(f"✓ Medical dictionary created: {dict_file}")
        print(f"  Contains {len(medical_terms)} terms")
        print()
        print("Usage in code:")
        print("""
```typescript
// In ocrService.ts
private medical_dictionary = [...]; // Load from database or file

private autocorrectMedicineName(ocrText: string): string {
  const words = ocrText.split(' ');
  return words.map(word => {
    // Find closest match in dictionary
    const closest = this.findClosestMatch(word, this.medical_dictionary);
    if (closest.distance < 3) { // Levenshtein distance threshold
      return closest.match;
    }
    return word;
  }).join(' ');
}
```
        """)
        print()


def main():
    print()
    print("╔═══════════════════════════════════════════════════════════════════╗")
    print("║     Tesseract Fine-tuning vs. Practical Alternatives Guide       ║")
    print("╚═══════════════════════════════════════════════════════════════════╝")
    print()
    
    tuner = TesseractFineTuner()
    
    # Show why fine-tuning might not be the best approach
    tuner.show_alternative_approaches()
    
    print("Do you still want to proceed with Tesseract fine-tuning? (y/n): ", end='')
    response = input().lower().strip()
    
    if response == 'y':
        print()
        print("Proceeding with training data preparation...")
        manifest = tuner.prepare_training_data()
        tuner.generate_box_files()
        print()
        print("⚠️  Note: Actual training requires additional tools and steps")
        print("   Documentation: https://github.com/tesseract-ocr/tesseract/wiki/TrainingTesseract")
    else:
        print()
        print("Smart choice! 🎯")
        print()
        print("Recommended next steps:")
        print("  1. Run: python generate_prescriptions.py")
        print("  2. Run: python test_ocr_accuracy.py")
        print("  3. Implement image preprocessing in ocrService.ts")
        print("  4. Build medical term autocorrection")
    
    # Always create medical dictionary as it's useful
    print()
    tuner.create_medical_dictionary()
    
    print()
    print("=" * 70)
    print("  Summary")
    print("=" * 70)
    print()
    print("For a campus project, the BEST approach is:")
    print("  ✓ Generate synthetic data (DONE)")
    print("  ✓ Test baseline OCR accuracy")
    print("  ✓ Add image preprocessing")
    print("  ✓ Implement medical term autocorrection")
    print("  ✓ Build good verification UI")
    print()
    print("This gives professional results without advanced ML complexity!")
    print()


if __name__ == "__main__":
    main()
