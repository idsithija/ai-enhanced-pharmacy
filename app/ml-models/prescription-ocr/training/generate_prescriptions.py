"""
Prescription Image Generator for OCR Training
Generates synthetic prescription images with realistic variations
"""

import json
import random
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

# Configuration
NUM_PRESCRIPTIONS = 100
IMAGE_WIDTH = 800
IMAGE_HEIGHT = 1000

# Quality distribution
QUALITY_DISTRIBUTION = {
    'high': 0.50,    # 50% high quality
    'medium': 0.30,  # 30% medium quality
    'low': 0.20      # 20% low quality
}

# Sample data
PATIENT_NAMES = [
    "John Silva", "Maria Perera", "Kasun Fernando", "Dilini Rajapaksa",
    "Nimal De Silva", "Sanduni Wickramasinghe", "Chaminda Jayawardena",
    "Rushika Gunasekara", "Thilini Dissanayake", "Nuwan Bandara",
    "Hasini Samaraweera", "Rohan Gamage", "Savithri Herath",
    "Prasanna Mendis", "Ayesha Pathirana", "Lakmal Rathnayake",
    "Ishara Rodrigo", "Buddhika Amarasinghe", "Shanika Kumarasinghe"
]

DOCTOR_NAMES = [
    "Dr. A. Fernando", "Dr. K. Perera", "Dr. S. Silva",
    "Dr. M. Gunawardena", "Dr. R. Jayasinghe", "Dr. N. Dissanayake",
    "Dr. P. Wickramasinghe", "Dr. T. Ratnayake"
]

HOSPITALS = [
    "Lanka Hospital", "Nawaloka Hospital", "Asiri Medical Center",
    "Durdans Hospital", "Apollo Hospital", "Central Hospital",
    "City Medical Center", "National Hospital"
]

MEDICINES = [
    {"name": "Paracetamol", "dosages": ["500mg", "650mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Amoxicillin", "dosages": ["250mg", "500mg"], "forms": ["Capsule", "Cap"]},
    {"name": "Omeprazole", "dosages": ["20mg", "40mg"], "forms": ["Capsule", "Cap"]},
    {"name": "Metformin", "dosages": ["500mg", "1000mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Amlodipine", "dosages": ["5mg", "10mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Atorvastatin", "dosages": ["10mg", "20mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Aspirin", "dosages": ["75mg", "100mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Cetirizine", "dosages": ["10mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Azithromycin", "dosages": ["250mg", "500mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Losartan", "dosages": ["25mg", "50mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Vitamin D3", "dosages": ["1000IU", "2000IU"], "forms": ["Capsule", "Cap"]},
    {"name": "Folic Acid", "dosages": ["5mg"], "forms": ["Tablet", "Tab"]},
]

FREQUENCIES = [
    "1-0-1 (Twice daily)",
    "1-1-1 (Three times daily)",
    "0-0-1 (Once daily at night)",
    "1-0-0 (Once daily in morning)",
    "Twice daily",
    "Three times daily",
    "As needed"
]

DURATIONS = ["5 days", "7 days", "10 days", "14 days", "1 month", "3 months"]


class PrescriptionGenerator:
    """Generate synthetic prescription images for training"""
    
    def __init__(self, output_dir: str = "../data"):
        self.output_dir = Path(output_dir)
        self.labels_dir = self.output_dir / "labels"
        self.metadata = []
        
        # Create directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.labels_dir.mkdir(parents=True, exist_ok=True)
        
        # Try to load fonts (use default if not available)
        self.fonts = self._load_fonts()
    
    def _load_fonts(self) -> Dict[str, ImageFont.FreeTypeFont]:
        """Load or create fonts for rendering"""
        fonts = {}
        try:
            # Try to use Arial (common on Windows)
            fonts['title'] = ImageFont.truetype("arial.ttf", 32)
            fonts['header'] = ImageFont.truetype("arial.ttf", 24)
            fonts['body'] = ImageFont.truetype("arial.ttf", 20)
            fonts['small'] = ImageFont.truetype("arial.ttf", 18)
        except:
            try:
                # Try DejaVu (common on Linux)
                fonts['title'] = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
                fonts['header'] = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
                fonts['body'] = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
                fonts['small'] = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
            except:
                # Use default font
                fonts['title'] = ImageFont.load_default()
                fonts['header'] = ImageFont.load_default()
                fonts['body'] = ImageFont.load_default()
                fonts['small'] = ImageFont.load_default()
        
        return fonts
    
    def _generate_random_date(self) -> str:
        """Generate a random date within last 30 days"""
        days_ago = random.randint(0, 30)
        date = datetime.now() - timedelta(days=days_ago)
        return date.strftime("%d/%m/%Y")
    
    def _generate_prescription_data(self) -> Dict:
        """Generate random prescription data"""
        num_medicines = random.randint(1, 5)
        medicines = []
        
        for i in range(num_medicines):
            med = random.choice(MEDICINES)
            medicines.append({
                "name": med["name"],
                "dosage": random.choice(med["dosages"]),
                "form": random.choice(med["forms"]),
                "frequency": random.choice(FREQUENCIES),
                "duration": random.choice(DURATIONS)
            })
        
        return {
            "patient_name": random.choice(PATIENT_NAMES),
            "patient_age": random.randint(18, 80),
            "doctor_name": random.choice(DOCTOR_NAMES),
            "hospital": random.choice(HOSPITALS),
            "date": self._generate_random_date(),
            "medicines": medicines
        }
    
    def _create_label_text(self, data: Dict) -> str:
        """Create the ground truth text for OCR"""
        lines = [
            data["hospital"],
            "",
            f"Patient Name: {data['patient_name']}",
            f"Age: {data['patient_age']} years",
            f"Date: {data['date']}",
            f"Doctor: {data['doctor_name']}",
            "",
            "Rx",
            ""
        ]
        
        for i, med in enumerate(data["medicines"], 1):
            lines.extend([
                f"{i}. {med['name']} {med['dosage']} {med['form']}",
                f"   {med['frequency']}",
                f"   Duration: {med['duration']}",
                ""
            ])
        
        lines.append(f"Signature: {data['doctor_name']}")
        
        return "\n".join(lines)
    
    def _draw_prescription(self, data: Dict) -> Image.Image:
        """Draw prescription image"""
        # Create white background
        img = Image.new('RGB', (IMAGE_WIDTH, IMAGE_HEIGHT), 'white')
        draw = ImageDraw.Draw(img)
        
        y = 40
        x_margin = 50
        
        # Hospital name (centered, bold)
        hospital_text = data["hospital"]
        draw.text((IMAGE_WIDTH // 2, y), hospital_text, fill='black', 
                 font=self.fonts['title'], anchor='mt')
        y += 60
        
        # Patient info
        draw.text((x_margin, y), f"Patient Name: {data['patient_name']}", 
                 fill='black', font=self.fonts['body'])
        y += 35
        draw.text((x_margin, y), f"Age: {data['patient_age']} years", 
                 fill='black', font=self.fonts['body'])
        y += 35
        draw.text((x_margin, y), f"Date: {data['date']}", 
                 fill='black', font=self.fonts['body'])
        y += 35
        draw.text((x_margin, y), f"Doctor: {data['doctor_name']}", 
                 fill='black', font=self.fonts['body'])
        y += 50
        
        # Rx symbol
        draw.text((x_margin, y), "Rx", fill='black', font=self.fonts['header'])
        y += 50
        
        # Medicines
        for i, med in enumerate(data["medicines"], 1):
            draw.text((x_margin, y), 
                     f"{i}. {med['name']} {med['dosage']} {med['form']}", 
                     fill='black', font=self.fonts['body'])
            y += 30
            draw.text((x_margin + 30, y), med['frequency'], 
                     fill='black', font=self.fonts['small'])
            y += 28
            draw.text((x_margin + 30, y), f"Duration: {med['duration']}", 
                     fill='black', font=self.fonts['small'])
            y += 40
        
        # Signature
        y = max(y + 20, IMAGE_HEIGHT - 100)
        draw.text((x_margin, y), f"Signature: {data['doctor_name']}", 
                 fill='black', font=self.fonts['body'])
        
        return img
    
    def _apply_quality_degradation(self, img: Image.Image, quality: str) -> Image.Image:
        """Apply quality degradation based on quality level"""
        if quality == 'high':
            return img
        
        elif quality == 'medium':
            # Slight blur
            img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(1, 2)))
            # Minor rotation
            angle = random.uniform(-3, 3)
            img = img.rotate(angle, fillcolor='white', expand=False)
            # Add slight noise
            img_array = np.array(img)
            noise = np.random.normal(0, 5, img_array.shape)
            img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
            img = Image.fromarray(img_array)
        
        else:  # low quality
            # Significant blur
            img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(3, 5)))
            # Larger rotation
            angle = random.uniform(-8, 8)
            img = img.rotate(angle, fillcolor='white', expand=False)
            # Add significant noise
            img_array = np.array(img)
            noise = np.random.normal(0, 15, img_array.shape)
            img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
            img = Image.fromarray(img_array)
        
        return img
    
    def _determine_quality(self, index: int) -> str:
        """Determine quality level based on distribution"""
        rand = random.random()
        if rand < QUALITY_DISTRIBUTION['high']:
            return 'high'
        elif rand < QUALITY_DISTRIBUTION['high'] + QUALITY_DISTRIBUTION['medium']:
            return 'medium'
        else:
            return 'low'
    
    def generate(self, num_prescriptions: int = NUM_PRESCRIPTIONS):
        """Generate all prescriptions"""
        print(f"🎨 Generating {num_prescriptions} synthetic prescriptions...")
        print(f"   Output: {self.output_dir}")
        print()
        
        for i in range(1, num_prescriptions + 1):
            # Generate prescription data
            data = self._generate_prescription_data()
            quality = self._determine_quality(i)
            
            # Create filenames
            prescription_id = f"{i:04d}"
            image_filename = f"prescription_{prescription_id}_{quality}.png"
            label_filename = f"prescription_{prescription_id}.txt"
            
            # Draw prescription
            img = self._draw_prescription(data)
            
            # Apply quality degradation
            img = self._apply_quality_degradation(img, quality)
            
            # Save image
            img.save(self.output_dir / image_filename)
            
            # Save label text
            label_text = self._create_label_text(data)
            (self.labels_dir / label_filename).write_text(label_text, encoding='utf-8')
            
            # Store metadata
            self.metadata.append({
                "id": i,
                "filename": image_filename,
                "label_file": label_filename,
                "quality": quality,
                "data": data
            })
            
            # Progress
            if i % 20 == 0:
                print(f"   Generated {i}/{num_prescriptions} prescriptions...")
        
        # Save metadata
        metadata_file = self.output_dir / "metadata.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)
        
        # Print summary
        print()
        print("✅ Generation complete!")
        print(f"   Total prescriptions: {num_prescriptions}")
        print(f"   High quality: {sum(1 for m in self.metadata if m['quality'] == 'high')}")
        print(f"   Medium quality: {sum(1 for m in self.metadata if m['quality'] == 'medium')}")
        print(f"   Low quality: {sum(1 for m in self.metadata if m['quality'] == 'low')}")
        print()
        print(f"📁 Files saved to:")
        print(f"   Images: {self.output_dir}")
        print(f"   Labels: {self.labels_dir}")
        print(f"   Metadata: {metadata_file}")


if __name__ == "__main__":
    print("=" * 60)
    print("PRESCRIPTION IMAGE GENERATOR")
    print("=" * 60)
    print()
    
    # Determine output directory
    script_dir = Path(__file__).parent
    output_dir = script_dir.parent / "data"
    
    print(f"Configuration:")
    print(f"  Prescriptions: {NUM_PRESCRIPTIONS}")
    print(f"  Image size: {IMAGE_WIDTH}x{IMAGE_HEIGHT}")
    print(f"  Quality distribution: High={QUALITY_DISTRIBUTION['high']*100:.0f}%, "
          f"Medium={QUALITY_DISTRIBUTION['medium']*100:.0f}%, "
          f"Low={QUALITY_DISTRIBUTION['low']*100:.0f}%")
    print()
    
    # Generate
    generator = PrescriptionGenerator(output_dir=str(output_dir))
    generator.generate(NUM_PRESCRIPTIONS)
    
    print()
    print("🎯 Next steps:")
    print("   1. python train.py              # Train the OCR model")
    print("   2. python test_accuracy.py      # Test accuracy")
    print()
