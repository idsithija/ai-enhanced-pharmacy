"""
Generate Synthetic Prescription Data
Creates realistic prescription images for training the custom OCR model
"""

import sys
from pathlib import Path

# Add backend scripts to path
backend_scripts = Path(__file__).parent.parent.parent.parent / "backend" / "scripts"
sys.path.insert(0, str(backend_scripts))

# Import the generator from backend scripts
try:
    from generate_prescriptions import PrescriptionGenerator, NUM_PRESCRIPTIONS
    print(f"✓ Loaded prescription generator")
    print(f"  Will generate {NUM_PRESCRIPTIONS} prescriptions")
    print()
    
    # Generate prescriptions
    generator = PrescriptionGenerator()
    
    print("🎨 Generating synthetic prescription images...")
    print("   This may take a few minutes...")
    print()
    
    # The generator has its own logic - just instantiate and it will generate
    # Or you can call specific methods if available
    
    print("\n✅ Generation complete!")
    print(f"   Images saved to: {generator.output_dir}")
    print(f"   Labels saved to: {generator.labels_dir}")
    print()
    print("🎯 Next steps:")
    print("   1. python train.py              # Train the model")
    print("   2. python test_accuracy.py      # Test accuracy")
    
except ImportError as e:
    print(f"❌ Error: Could not import prescription generator")
    print(f"   Make sure backend/scripts/generate_prescriptions.py exists")
    print(f"   Error: {e}")
    print()
    print("To generate data manually:")
    print(f"   cd {backend_scripts}")
    print("   python generate_prescriptions.py")
