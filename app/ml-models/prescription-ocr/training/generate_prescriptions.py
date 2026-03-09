"""
Prescription Image Generator for OCR Training
Generates synthetic prescription images with realistic variations
"""

import random
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

# Configuration
NUM_PRESCRIPTIONS = 1500  # Increased from 100 to 1500 for better model training
IMAGE_WIDTH = 800
IMAGE_HEIGHT = 1000

# Quality distribution
QUALITY_DISTRIBUTION = {
    'high': 0.50,    # 50% high quality
    'medium': 0.30,  # 30% medium quality
    'low': 0.20      # 20% low quality
}

# Expanded Sample Data for Maximum Diversity
PATIENT_NAMES = [
    # Original Sri Lankan names
    "John Silva", "Maria Perera", "Kasun Fernando", "Dilini Rajapaksa",
    "Nimal De Silva", "Sanduni Wickramasinghe", "Chaminda Jayawardena",
    "Rushika Gunasekara", "Thilini Dissanayake", "Nuwan Bandara",
    "Hasini Samaraweera", "Rohan Gamage", "Savithri Herath",
    "Prasanna Mendis", "Ayesha Pathirana", "Lakmal Rathnayake",
    "Ishara Rodrigo", "Buddhika Amarasinghe", "Shanika Kumarasinghe",
    # Additional Sri Lankan names (60+ more)
    "Malith Jayakody", "Nadeesha Wickremasinghe", "Udara Gamage", "Yasmin Fonseka",
    "Sameera Pathirana", "Janaki Munasinghe", "Kusal Rajapakse", "Dilrukshi Senanayake",
    "Asanka Herath", "Minoli Samarasinghe", "Gayan Liyanage", "Rashmi Wanninayake",
    "Manoj Gunathilake", "Thanuja Ratnayake", "Sachini Dharmasena", "Buddhika Wijesekara",
    "Hasini Kudagama", "Danushka Perera", "Amaya Cooray", "Upul Mendis",
    "Nethmi Karunaratne", "Charith Atapattu", "Madushani Ekanayake", "Dinesh Madushanka",
    "Shashika Priyankara", "Chaminda Rajakaruna", "Gayani Kapukotuwa", "Nuwan Pradeep",
    "Tharanga Vithanage", "Senali Weerasinghe", "Kavindya Gunaratne", "Chatura Alwis",
    "Dimuthu Karunaratne", "Niluka Fernando", "Prabath Nissanka", "Shalini Kodagoda",
    "Anuradha Jayalath", "Hemantha Silva", "Priyani Wijesinghe", "Sanjeewa Cooray",
    "Mihira Rashmika", "Ravindra Pushpakumara", "Tharushi Handapangoda", "Mahinda Rajapaksa",
    "Chandrika Kumaratunga", "Ranil Wickremesinghe", "Sajith Premadasa", "Maithripala Sirisena",
    # South Asian diversity
    "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
    "Anjali Gupta", "Suresh Nair", "Kavita Menon", "Arjun Krishnan", "Deepa Iyer",
    "Ravi Mukherjee", "Pooja Desai", "Kiran Rao", "Meera Joshi", "Anil Chatterjee",
    # International names
    "David Anderson", "Sarah Johnson", "Michael Chen", "Emily Williams", "James Brown",
    "Lisa Davis", "Robert Martinez", "Jennifer Garcia", "William Rodriguez", "Mary Wilson",
    "John Taylor", "Patricia Moore", "Richard Jackson", "Linda Martin", "Thomas Lee",
    "Elizabeth Thompson", "Christopher White", "Barbara Harris", "Daniel Clark", "Jessica Lewis",
    "Matthew Robinson", "Ashley Walker", "Andrew Young", "Amanda Hall", "Joshua Allen",
    "Stephanie King", "Ryan Wright", "Michelle Lopez", "Kevin Hill", "Melissa Green",
    # Middle Eastern names
    "Ahmed Hassan", "Fatima Ali", "Omar Abdullah", "Aisha Khan", "Mohammed Rahman",
    # East Asian names
    "Li Wei", "Zhang Mei", "Wang Jian", "Liu Yang", "Tanaka Hiroshi", "Kim Min-Jun"
]

DOCTOR_NAMES = [
    # Original doctors
    "Dr. A. Fernando", "Dr. K. Perera", "Dr. S. Silva",
    "Dr. M. Gunawardena", "Dr. R. Jayasinghe", "Dr. N. Dissanayake",
    "Dr. P. Wickramasinghe", "Dr. T. Ratnayake",
    # Additional doctors (20+ more)
    "Dr. Chandana Wijesuriya", "Dr. Lakshmi Fernando", "Dr. Ajith Perera",
    "Dr. Suresh Bandara", "Dr. Nirmala Silva", "Dr. Rohan Jayasuriya",
    "Dr. Priyanka De Silva", "Dr. Mahesh Rathnayake", "Dr. Sampath Kumarasinghe",
    "Dr. Anoma Jayawardena", "Dr. Nishan Gunaratne", "Dr. Buddhika Wickramasinghe",
    "Dr. Chamari Amarasena", "Dr. Ruwan Samarakoon", "Dr. Manjula Seneviratne",
    "Dr. Indika Balasuriya", "Dr. Prasanna Gunasekara", "Dr. Yasmin Fonseka",
    "Dr. Ashan Pathirana", "Dr. Sarah Chen", "Dr. Michael Thompson", "Dr. Priya Sharma",
    "Dr. David Anderson", "Dr. Emily Williams", "Dr. Ahmed Hassan", "Dr. James Rodriguez",
    "Dr. Lisa Wang", "Dr. Robert Kumar"
]

HOSPITALS = [
    # Original hospitals
    "Lanka Hospital", "Nawaloka Hospital", "Asiri Medical Center",
    "Durdans Hospital", "Apollo Hospital", "Central Hospital",
    "City Medical Center", "National Hospital",
    # Additional Sri Lankan hospitals (15+ more)
    "Asiri Central Hospital", "Hemas Hospital", "Oasis Hospital",
    "Ninewells Hospital", "Golden Key Hospital", "Royal Hospital",
    "Colombo South Teaching Hospital", "National Hospital of Sri Lanka",
    "Lady Ridgeway Hospital", "General Hospital Kandy", "Teaching Hospital Karapitiya",
    # International/Generic hospitals
    "St. Michael's Medical Center", "Metro Healthcare Hospital", "Prime Care Hospital",
    "Sunshine Medical Center", "Greenfield Hospital", "Riverside Medical Center",
    "Valley View Hospital", "Summit Healthcare", "Lakeside Medical Center",
    "Harbor Medical Hospital", "Meadowbrook Healthcare", "Clearwater Hospital"
]

MEDICINES = [
    # Original medicines
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
    # Additional common medicines (25+ more)
    {"name": "Ibuprofen", "dosages": ["200mg", "400mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Ciprofloxacin", "dosages": ["250mg", "500mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Doxycycline", "dosages": ["100mg"], "forms": ["Capsule", "Cap"]},
    {"name": "Simvastatin", "dosages": ["10mg", "20mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Lisinopril", "dosages": ["5mg", "10mg", "20mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Levothyroxine", "dosages": ["50mcg", "100mcg"], "forms": ["Tablet", "Tab"]},
    {"name": "Pantoprazole", "dosages": ["20mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Ranitidine", "dosages": ["150mg", "300mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Diclofenac", "dosages": ["25mg", "50mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Gabapentin", "dosages": ["100mg", "300mg"], "forms": ["Capsule", "Cap"]},
    {"name": "Tramadol", "dosages": ["50mg", "100mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Furosemide", "dosages": ["20mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Warfarin", "dosages": ["2mg", "5mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Propranolol", "dosages": ["10mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Clarithromycin", "dosages": ["250mg", "500mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Montelukast", "dosages": ["4mg", "10mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Clopidogrel", "dosages": ["75mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Valsartan", "dosages": ["40mg", "80mg", "160mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Esomeprazole", "dosages": ["20mg", "40mg"], "forms": ["Capsule", "Cap"]},
    {"name": "Rosuvastatin", "dosages": ["5mg", "10mg", "20mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Fexofenadine", "dosages": ["120mg", "180mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Metoprolol", "dosages": ["25mg", "50mg", "100mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Sertraline", "dosages": ["50mg", "100mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Prednisolone", "dosages": ["5mg", "10mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Salbutamol", "dosages": ["2mg", "4mg"], "forms": ["Tablet", "Tab", "Inhaler"]},
    {"name": "Calcium Carbonate", "dosages": ["500mg", "1000mg"], "forms": ["Tablet", "Tab"]}
]

FREQUENCIES = [
    "1-0-1 (Twice daily)",
    "1-1-1 (Three times daily)",
    "0-0-1 (Once daily at night)",
    "1-0-0 (Once daily in morning)",
    "Twice daily",
    "Three times daily",
    "As needed",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "At bedtime",
    "Before meals",
    "After meals",
    "Four times daily"
]

DURATIONS = ["5 days", "7 days", "10 days", "14 days", "1 month", "3 months", "3 days", "21 days", "2 weeks", "30 days", "2 months", "6 months"]


class PrescriptionGenerator:
    """Generate synthetic prescription images for training"""
    
    def __init__(self, output_dir: str = "../data", clean_existing: bool = True):
        self.output_dir = Path(output_dir)
        self.labels_dir = self.output_dir / "labels"
        
        # Clean existing data if requested
        if clean_existing:
            self._clean_existing_data()
        
        # Create directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.labels_dir.mkdir(parents=True, exist_ok=True)
        
        # Try to load fonts (use default if not available)
        self.fonts = self._load_fonts()
    
    def _clean_existing_data(self):
        """Remove existing prescription data but keep git-related files"""
        if self.output_dir.exists():
            print(f"🧹 Cleaning existing data in {self.output_dir}...")
            
            # Remove all prescription images
            for img_file in self.output_dir.glob("prescription_*.png"):
                img_file.unlink()
            
            # Remove metadata (not used by training)
            metadata_file = self.output_dir / "metadata.json"
            if metadata_file.exists():
                metadata_file.unlink()
            
            # Remove label files
            if self.labels_dir.exists():
                for label_file in self.labels_dir.glob("prescription_*.txt"):
                    label_file.unlink()
            
            print("   ✅ Existing data cleaned (git files preserved)")
            print()
    
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
    
    def _draw_prescription_template_1(self, img, draw, data: Dict):
        """Standard centered header layout"""
        y = 40
        x_margin = 50
        
        # Hospital name (centered)
        draw.text((IMAGE_WIDTH // 2, y), data["hospital"], fill='black', 
                 font=self.fonts['title'], anchor='mt')
        y += 60
        
        # Patient info
        draw.text((x_margin, y), f"Patient Name: {data['patient_name']}", fill='black', font=self.fonts['body'])
        y += 35
        draw.text((x_margin, y), f"Age: {data['patient_age']} years", fill='black', font=self.fonts['body'])
        y += 35
        draw.text((x_margin, y), f"Date: {data['date']}", fill='black', font=self.fonts['body'])
        y += 35
        draw.text((x_margin, y), f"Doctor: {data['doctor_name']}", fill='black', font=self.fonts['body'])
        y += 50
        
        # Rx symbol
        draw.text((x_margin, y), "Rx", fill='black', font=self.fonts['header'])
        y += 50
        
        # Medicines
        for i, med in enumerate(data["medicines"], 1):
            draw.text((x_margin, y), f"{i}. {med['name']} {med['dosage']} {med['form']}", fill='black', font=self.fonts['body'])
            y += 30
            draw.text((x_margin + 30, y), med['frequency'], fill='black', font=self.fonts['small'])
            y += 28
            draw.text((x_margin + 30, y), f"Duration: {med['duration']}", fill='black', font=self.fonts['small'])
            y += 40
        
        # Signature
        y = max(y + 20, IMAGE_HEIGHT - 100)
        draw.text((x_margin, y), f"Signature: {data['doctor_name']}", fill='black', font=self.fonts['body'])
    
    def _draw_prescription_template_2(self, img, draw, data: Dict):
        """Left-aligned header with box layout"""
        y = 30
        x_margin = 60
        
        # Draw border
        draw.rectangle([(20, 20), (IMAGE_WIDTH - 20, IMAGE_HEIGHT - 20)], outline='black', width=2)
        
        # Hospital name (left-aligned)
        draw.text((x_margin, y), data["hospital"], fill='black', font=self.fonts['title'])
        y += 70
        
        # Divider line
        draw.line([(40, y), (IMAGE_WIDTH - 40, y)], fill='black', width=1)
        y += 30
        
        # Patient details in table format
        draw.text((x_margin, y), "Patient:", fill='black', font=self.fonts['header'])
        draw.text((x_margin + 150, y), data['patient_name'], fill='black', font=self.fonts['body'])
        y += 35
        draw.text((x_margin, y), "Age:", fill='black', font=self.fonts['body'])
        draw.text((x_margin + 150, y), f"{data['patient_age']} years", fill='black', font=self.fonts['body'])
        y += 30
        draw.text((x_margin, y), "Date:", fill='black', font=self.fonts['body'])
        draw.text((x_margin + 150, y), data['date'], fill='black', font=self.fonts['body'])
        y += 40
        
        # Medicines section
        draw.text((x_margin, y), "PRESCRIPTION", fill='black', font=self.fonts['header'])
        y += 45
        
        for i, med in enumerate(data["medicines"], 1):
            draw.text((x_margin + 10, y), f"{i}. {med['name']} - {med['dosage']} {med['form']}", fill='black', font=self.fonts['body'])
            y += 28
            draw.text((x_margin + 25, y), f"Frequency: {med['frequency']}", fill='black', font=self.fonts['small'])
            y += 25
            draw.text((x_margin + 25, y), f"Duration: {med['duration']}", fill='black', font=self.fonts['small'])
            y += 35
        
        # Doctor signature at bottom
        y = IMAGE_HEIGHT - 80
        draw.text((IMAGE_WIDTH - 300, y), f"Dr. {data['doctor_name'].replace('Dr. ', '')}", fill='black', font=self.fonts['body'])
    
    def _draw_prescription_template_3(self, img, draw, data: Dict):
        """Compact two-column layout"""
        y = 35
        x_left = 50
        x_right = IMAGE_WIDTH // 2 + 20
        
        # Hospital header with underline
        draw.text((IMAGE_WIDTH // 2, y), data["hospital"], fill='black', font=self.fonts['title'], anchor='mt')
        y += 45
        draw.line([(50, y), (IMAGE_WIDTH - 50, y)], fill='black', width=2)
        y += 40
        
        # Two-column patient info
        draw.text((x_left, y), "Patient:", fill='black', font=self.fonts['body'])
        draw.text((x_left, y + 25), data['patient_name'], fill='black', font=self.fonts['body'])
        draw.text((x_right, y), "Date:", fill='black', font=self.fonts['body'])
        draw.text((x_right, y + 25), data['date'], fill='black', font=self.fonts['body'])
        y += 60
        
        draw.text((x_left, y), f"Age: {data['patient_age']} years", fill='black', font=self.fonts['small'])
        draw.text((x_right, y), f"Dr: {data['doctor_name'].replace('Dr. ', '')}", fill='black', font=self.fonts['small'])
        y += 50
        
        # Rx header
        draw.text((x_left, y), "Rx:", fill='black', font=self.fonts['header'])
        y += 45
        
        # Medicine list
        for i, med in enumerate(data["medicines"], 1):
            draw.text((x_left + 20, y), f"{i}. {med['name']} {med['dosage']}", fill='black', font=self.fonts['body'])
            y += 28
            draw.text((x_left + 40, y), f"{med['frequency']} - {med['duration']}", fill='black', font=self.fonts['small'])
            y += 35
    
    def _draw_prescription_template_4(self, img, draw, data: Dict):
        """Modern minimal layout with header block"""
        y = 25
        x_margin = 55
        
        # Header block with background
        draw.rectangle([(0, 0), (IMAGE_WIDTH, 100)], fill='#f0f0f0')
        draw.text((IMAGE_WIDTH // 2, 50), data["hospital"], fill='black', font=self.fonts['title'], anchor='mm')
        y = 130
        
        # Patient info section
        draw.text((x_margin, y), f"PATIENT: {data['patient_name']}", fill='black', font=self.fonts['body'])
        y += 35
        draw.text((x_margin, y), f"AGE: {data['patient_age']} | DATE: {data['date']}", fill='black', font=self.fonts['small'])
        y += 50
        
        # Prescription section
        draw.text((x_margin, y), "MEDICATIONS:", fill='black', font=self.fonts['header'])
        y += 40
        
        for i, med in enumerate(data["medicines"], 1):
            # Medicine name and dosage
            draw.text((x_margin + 15, y), f"{i}. {med['name']}", fill='black', font=self.fonts['body'])
            y += 25
            draw.text((x_margin + 30, y), f"Dose: {med['dosage']} {med['form']} | {med['frequency']}", fill='black', font=self.fonts['small'])
            y += 22
            draw.text((x_margin + 30, y), f"Duration: {med['duration']}", fill='black', font=self.fonts['small'])
            y += 35
        
        # Footer
        y = IMAGE_HEIGHT - 90
        draw.line([(x_margin, y), (IMAGE_WIDTH - x_margin, y)], fill='gray', width=1)
        y += 20
        draw.text((IMAGE_WIDTH - 250, y), data['doctor_name'], fill='black', font=self.fonts['body'])
    
    def _draw_prescription(self, data: Dict) -> Image.Image:
        """Draw prescription image using random template for diversity"""
        # Create white background
        img = Image.new('RGB', (IMAGE_WIDTH, IMAGE_HEIGHT), 'white')
        draw = ImageDraw.Draw(img)
        
        # Randomly select a template (4 different layouts)
        template = random.randint(1, 4)
        
        if template == 1:
            self._draw_prescription_template_1(img, draw, data)
        elif template == 2:
            self._draw_prescription_template_2(img, draw, data)
        elif template == 3:
            self._draw_prescription_template_3(img, draw, data)
        else:
            self._draw_prescription_template_4(img, draw, data)
        
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
        
        quality_counts = {'high': 0, 'medium': 0, 'low': 0}
        
        for i in range(1, num_prescriptions + 1):
            # Generate prescription data
            data = self._generate_prescription_data()
            quality = self._determine_quality(i)
            quality_counts[quality] += 1
            
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
            
            # Progress
            if i % 20 == 0:
                print(f"   Generated {i}/{num_prescriptions} prescriptions...")
        
        # Print summary
        print()
        print("✅ Generation complete!")
        print(f"   Total prescriptions: {num_prescriptions}")
        print(f"   High quality: {quality_counts['high']}")
        print(f"   Medium quality: {quality_counts['medium']}")
        print(f"   Low quality: {quality_counts['low']}")
        print()
        print(f"📁 Files saved to:")
        print(f"   Images: {self.output_dir}")
        print(f"   Labels: {self.labels_dir}")


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
