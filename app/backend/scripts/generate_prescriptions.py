"""
Synthetic Prescription Image Generator
Generates realistic prescription images for OCR training and testing
"""

import os
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from datetime import datetime, timedelta
import json

# Configuration
OUTPUT_DIR = "synthetic_prescriptions"
LABELS_DIR = "synthetic_prescriptions/labels"
NUM_PRESCRIPTIONS = 100  # Number of prescriptions to generate

# Sample data pools
PATIENT_NAMES = [
    "John Silva", "Maria Perera", "Kasun Fernando", "Nimal Rodrigo",
    "Saman Jayawardena", "Anura Wijesinghe", "Dilini Rajapaksa",
    "Chaminda Gunasekara", "Sandali Wickramasinghe", "Ruwan De Silva"
]

DOCTOR_NAMES = [
    "Dr. A. Fernando", "Dr. K. Perera", "Dr. S. Wijesinghe",
    "Dr. N. Silva", "Dr. M. Jayawardena", "Dr. R. Gunaratne"
]

HOSPITALS = [
    "National Hospital", "Lanka Hospital", "Asiri Medical Center",
    "Nawaloka Hospital", "Durdans Hospital", "City Hospital"
]

# Common medicines with dosages
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
    {"name": "Prednisolone", "dosages": ["5mg", "10mg"], "forms": ["Tablet", "Tab"]},
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
    def __init__(self, output_dir=OUTPUT_DIR):
        self.output_dir = output_dir
        self.labels_dir = LABELS_DIR
        
        # Create directories
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.labels_dir, exist_ok=True)
        
        # Try to load fonts (will use default if not found)
        self.fonts = self._load_fonts()
    
    def _load_fonts(self):
        """Load various fonts for different text elements"""
        fonts = {}
        
        # Default font sizes
        try:
            # Try to load system fonts
            fonts['title'] = ImageFont.truetype("arial.ttf", 24)
            fonts['header'] = ImageFont.truetype("arial.ttf", 16)
            fonts['body'] = ImageFont.truetype("arial.ttf", 14)
            fonts['small'] = ImageFont.truetype("arial.ttf", 12)
            fonts['medicine'] = ImageFont.truetype("arialbd.ttf", 14)  # Bold for medicines
        except:
            # Fallback to default fonts
            print("⚠️  System fonts not found, using default fonts")
            fonts['title'] = ImageFont.load_default()
            fonts['header'] = ImageFont.load_default()
            fonts['body'] = ImageFont.load_default()
            fonts['small'] = ImageFont.load_default()
            fonts['medicine'] = ImageFont.load_default()
        
        return fonts
    
    def generate_prescription_data(self):
        """Generate random prescription data"""
        num_medicines = random.randint(1, 5)
        medicines_list = []
        
        for _ in range(num_medicines):
            med = random.choice(MEDICINES)
            dosage = random.choice(med['dosages'])
            form = random.choice(med['forms'])
            frequency = random.choice(FREQUENCIES)
            duration = random.choice(DURATIONS)
            
            medicines_list.append({
                'name': med['name'],
                'dosage': dosage,
                'form': form,
                'frequency': frequency,
                'duration': duration,
                'full_text': f"{med['name']} {dosage} {form} - {frequency} - {duration}"
            })
        
        # Generate random date within last 30 days
        days_ago = random.randint(0, 30)
        prescription_date = datetime.now() - timedelta(days=days_ago)
        
        return {
            'patient_name': random.choice(PATIENT_NAMES),
            'patient_age': random.randint(18, 80),
            'doctor_name': random.choice(DOCTOR_NAMES),
            'hospital': random.choice(HOSPITALS),
            'date': prescription_date.strftime('%d/%m/%Y'),
            'medicines': medicines_list
        }
    
    def create_prescription_image(self, data, prescription_id, quality='high'):
        """
        Create a prescription image
        quality: 'high', 'medium', 'low' - affects clarity and noise
        """
        # Image dimensions
        width, height = 800, 1000
        
        # Create white background
        img = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Starting position
        y_position = 50
        
        # Draw Header
        draw.text((width//2 - 150, y_position), data['hospital'], 
                 fill='black', font=self.fonts['title'])
        y_position += 40
        
        # Draw horizontal line
        draw.line([(50, y_position), (width-50, y_position)], fill='black', width=2)
        y_position += 20
        
        # Patient Information
        draw.text((50, y_position), f"Patient Name: {data['patient_name']}", 
                 fill='black', font=self.fonts['body'])
        y_position += 30
        
        draw.text((50, y_position), f"Age: {data['patient_age']} years", 
                 fill='black', font=self.fonts['body'])
        draw.text((400, y_position), f"Date: {data['date']}", 
                 fill='black', font=self.fonts['body'])
        y_position += 40
        
        # Doctor Information
        draw.text((50, y_position), f"Doctor: {data['doctor_name']}", 
                 fill='black', font=self.fonts['body'])
        y_position += 40
        
        # Rx Symbol
        draw.text((50, y_position), "Rx", fill='blue', font=self.fonts['title'])
        y_position += 50
        
        # Medicines Section
        for i, med in enumerate(data['medicines'], 1):
            # Medicine number
            draw.text((70, y_position), f"{i}.", fill='black', font=self.fonts['body'])
            
            # Medicine name and dosage (bold)
            draw.text((100, y_position), f"{med['name']} {med['dosage']} {med['form']}", 
                     fill='black', font=self.fonts['medicine'])
            y_position += 25
            
            # Frequency and duration
            draw.text((120, y_position), f"{med['frequency']}", 
                     fill='black', font=self.fonts['small'])
            y_position += 20
            
            draw.text((120, y_position), f"Duration: {med['duration']}", 
                     fill='black', font=self.fonts['small'])
            y_position += 35
        
        # Footer
        y_position = height - 100
        draw.line([(50, y_position), (width-50, y_position)], fill='black', width=1)
        y_position += 20
        draw.text((50, y_position), f"Signature: {data['doctor_name']}", 
                 fill='black', font=self.fonts['small'])
        
        # Apply quality degradation based on quality level
        if quality == 'medium':
            # Add slight blur
            img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
            # Add noise
            img = self._add_noise(img, amount=10)
        elif quality == 'low':
            # Add more blur
            img = img.filter(ImageFilter.GaussianBlur(radius=1.5))
            # Add more noise
            img = self._add_noise(img, amount=25)
            # Rotate slightly
            img = img.rotate(random.uniform(-2, 2), fillcolor='white')
        
        return img
    
    def _add_noise(self, img, amount=10):
        """Add random noise to image to simulate scan quality"""
        pixels = img.load()
        width, height = img.size
        
        for _ in range(amount * 100):
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            noise = random.randint(-30, 30)
            
            r, g, b = pixels[x, y]
            r = max(0, min(255, r + noise))
            g = max(0, min(255, g + noise))
            b = max(0, min(255, b + noise))
            pixels[x, y] = (r, g, b)
        
        return img
    
    def generate_batch(self, count=100, quality_distribution=None):
        """
        Generate a batch of prescriptions
        quality_distribution: dict with 'high', 'medium', 'low' percentages
        """
        if quality_distribution is None:
            quality_distribution = {'high': 0.5, 'medium': 0.3, 'low': 0.2}
        
        print(f"🏥 Generating {count} synthetic prescriptions...")
        
        metadata = []
        
        for i in range(count):
            # Determine quality
            rand = random.random()
            if rand < quality_distribution['high']:
                quality = 'high'
            elif rand < quality_distribution['high'] + quality_distribution['medium']:
                quality = 'medium'
            else:
                quality = 'low'
            
            # Generate prescription data
            data = self.generate_prescription_data()
            
            # Create image
            img = self.create_prescription_image(data, i, quality)
            
            # Save image
            image_filename = f"prescription_{i+1:04d}_{quality}.png"
            image_path = os.path.join(self.output_dir, image_filename)
            img.save(image_path)
            
            # Create ground truth text for OCR training
            ground_truth = self._create_ground_truth(data)
            
            # Save label file
            label_filename = f"prescription_{i+1:04d}.txt"
            label_path = os.path.join(self.labels_dir, label_filename)
            with open(label_path, 'w', encoding='utf-8') as f:
                f.write(ground_truth)
            
            # Save metadata
            metadata.append({
                'id': i + 1,
                'filename': image_filename,
                'label_file': label_filename,
                'quality': quality,
                'data': data,
                'ground_truth': ground_truth
            })
            
            if (i + 1) % 10 == 0:
                print(f"  ✓ Generated {i + 1}/{count} prescriptions")
        
        # Save metadata JSON
        metadata_path = os.path.join(self.output_dir, 'metadata.json')
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Successfully generated {count} prescriptions!")
        print(f"  📁 Images: {self.output_dir}/")
        print(f"  📄 Labels: {self.labels_dir}/")
        print(f"  📊 Metadata: {metadata_path}")
        
        return metadata
    
    def _create_ground_truth(self, data):
        """Create ground truth text for OCR comparison"""
        lines = [
            data['hospital'],
            "",
            f"Patient Name: {data['patient_name']}",
            f"Age: {data['patient_age']} years",
            f"Date: {data['date']}",
            f"Doctor: {data['doctor_name']}",
            "",
            "Rx",
            ""
        ]
        
        for i, med in enumerate(data['medicines'], 1):
            lines.append(f"{i}. {med['name']} {med['dosage']} {med['form']}")
            lines.append(f"   {med['frequency']}")
            lines.append(f"   Duration: {med['duration']}")
            lines.append("")
        
        lines.append(f"Signature: {data['doctor_name']}")
        
        return "\n".join(lines)


if __name__ == "__main__":
    print("=" * 60)
    print("  Synthetic Prescription Generator for OCR Training")
    print("=" * 60)
    print()
    
    generator = PrescriptionGenerator()
    
    # Generate prescriptions with different quality levels
    metadata = generator.generate_batch(
        count=NUM_PRESCRIPTIONS,
        quality_distribution={
            'high': 0.5,    # 50% high quality (clear scans)
            'medium': 0.3,  # 30% medium quality (slight blur/noise)
            'low': 0.2      # 20% low quality (noisy/rotated)
        }
    )
    
    print()
    print("=" * 60)
    print("  Generation Complete!")
    print("=" * 60)
    print()
    print("Next Steps:")
    print("  1. Run: python test_ocr_accuracy.py")
    print("  2. Review OCR accuracy results")
    print("  3. Use images to demo the prescription upload feature")
    print()
