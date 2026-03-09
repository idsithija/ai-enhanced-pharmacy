"""
Line-Level Training Data Generator for TrOCR
=============================================
Generates individual text line images + labels for proper TrOCR training.
TrOCR reads ONE line at a time, so we train it on single lines.
"""

import random
from pathlib import Path
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

# Configuration
NUM_PRESCRIPTIONS = 100  # Each prescription generates 8-15 lines → ~1500 line images
LINE_IMAGE_WIDTH = 800
LINE_IMAGE_HEIGHT = 60  # Single line height

# Quality distribution for degradation
QUALITY_WEIGHTS = [0.50, 0.30, 0.20]  # high, medium, low

# ==================== DATA ====================

PATIENT_NAMES = [
    "John Silva", "Maria Perera", "Kasun Fernando", "Dilini Rajapaksa",
    "Nimal De Silva", "Sanduni Wickramasinghe", "Chaminda Jayawardena",
    "Rushika Gunasekara", "Thilini Dissanayake", "Nuwan Bandara",
    "Hasini Samaraweera", "Rohan Gamage", "Savithri Herath",
    "Prasanna Mendis", "Ayesha Pathirana", "Lakmal Rathnayake",
    "Ishara Rodrigo", "Buddhika Amarasinghe", "Shanika Kumarasinghe",
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
    "Mihira Rashmika", "Ravindra Pushpakumara", "Tharushi Handapangoda",
    "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
    "Anjali Gupta", "Suresh Nair", "Kavita Menon", "Arjun Krishnan", "Deepa Iyer",
    "David Anderson", "Sarah Johnson", "Michael Chen", "Emily Williams", "James Brown",
    "Lisa Davis", "Robert Martinez", "Jennifer Garcia", "William Rodriguez", "Mary Wilson",
    "Ahmed Hassan", "Fatima Ali", "Omar Abdullah", "Aisha Khan", "Mohammed Rahman",
    "Li Wei", "Zhang Mei", "Wang Jian", "Tanaka Hiroshi", "Kim Min-Jun",
]

DOCTOR_NAMES = [
    "Dr. A. Fernando", "Dr. K. Perera", "Dr. S. Silva",
    "Dr. M. Gunawardena", "Dr. R. Jayasinghe", "Dr. N. Dissanayake",
    "Dr. P. Wickramasinghe", "Dr. T. Ratnayake",
    "Dr. Chandana Wijesuriya", "Dr. Lakshmi Fernando", "Dr. Ajith Perera",
    "Dr. Suresh Bandara", "Dr. Nirmala Silva", "Dr. Rohan Jayasuriya",
    "Dr. Priyanka De Silva", "Dr. Mahesh Rathnayake", "Dr. Sampath Kumarasinghe",
    "Dr. Anoma Jayawardena", "Dr. Nishan Gunaratne", "Dr. Buddhika Wickramasinghe",
    "Dr. Chamari Amarasena", "Dr. Ruwan Samarakoon", "Dr. Manjula Seneviratne",
    "Dr. Sarah Chen", "Dr. Michael Thompson", "Dr. Priya Sharma",
    "Dr. David Anderson", "Dr. Emily Williams", "Dr. Ahmed Hassan",
]

HOSPITALS = [
    "Lanka Hospital", "Nawaloka Hospital", "Asiri Medical Center",
    "Durdans Hospital", "Apollo Hospital", "Central Hospital",
    "City Medical Center", "National Hospital",
    "Asiri Central Hospital", "Hemas Hospital", "Oasis Hospital",
    "Ninewells Hospital", "Golden Key Hospital", "Royal Hospital",
    "National Hospital of Sri Lanka", "Lady Ridgeway Hospital",
    "General Hospital Kandy", "Teaching Hospital Karapitiya",
    "St. Michael's Medical Center", "Metro Healthcare Hospital",
    "Prime Care Hospital", "Sunshine Medical Center", "Greenfield Hospital",
    "Riverside Medical Center", "Valley View Hospital", "Summit Healthcare",
    "Lakeside Medical Center", "Harbor Medical Hospital", "Clearwater Hospital",
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
    {"name": "Ibuprofen", "dosages": ["200mg", "400mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Ciprofloxacin", "dosages": ["250mg", "500mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Doxycycline", "dosages": ["100mg"], "forms": ["Capsule", "Cap"]},
    {"name": "Simvastatin", "dosages": ["10mg", "20mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Lisinopril", "dosages": ["5mg", "10mg", "20mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Levothyroxine", "dosages": ["50mcg", "100mcg"], "forms": ["Tablet", "Tab"]},
    {"name": "Pantoprazole", "dosages": ["20mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Diclofenac", "dosages": ["25mg", "50mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Gabapentin", "dosages": ["100mg", "300mg"], "forms": ["Capsule", "Cap"]},
    {"name": "Furosemide", "dosages": ["20mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Warfarin", "dosages": ["2mg", "5mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Propranolol", "dosages": ["10mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Clarithromycin", "dosages": ["250mg", "500mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Montelukast", "dosages": ["4mg", "10mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Clopidogrel", "dosages": ["75mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Rosuvastatin", "dosages": ["5mg", "10mg", "20mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Fexofenadine", "dosages": ["120mg", "180mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Metoprolol", "dosages": ["25mg", "50mg", "100mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Sertraline", "dosages": ["50mg", "100mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Prednisolone", "dosages": ["5mg", "10mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Salbutamol", "dosages": ["2mg", "4mg"], "forms": ["Tablet", "Inhaler"]},
    {"name": "Calcium Carbonate", "dosages": ["500mg", "1000mg"], "forms": ["Tablet", "Tab"]},
]

FREQUENCIES = [
    "1-0-1 (Twice daily)", "1-1-1 (Three times daily)",
    "0-0-1 (Once daily at night)", "1-0-0 (Once daily in morning)",
    "Twice daily", "Three times daily", "As needed",
    "Every 6 hours", "Every 8 hours", "Every 12 hours",
    "At bedtime", "Before meals", "After meals",
]

DURATIONS = [
    "5 days", "7 days", "10 days", "14 days", "1 month",
    "3 months", "3 days", "21 days", "2 weeks", "30 days",
]


def load_fonts():
    """Load fonts for rendering"""
    fonts = {}
    sizes = {'large': 36, 'medium': 28, 'normal': 24, 'small': 20}
    for key, size in sizes.items():
        try:
            fonts[key] = ImageFont.truetype("arial.ttf", size)
        except OSError:
            try:
                fonts[key] = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
            except OSError:
                fonts[key] = ImageFont.load_default()
    return fonts


def random_date():
    """Generate a random date string"""
    days_ago = random.randint(0, 30)
    d = datetime.now() - timedelta(days=days_ago)
    fmt = random.choice(["%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"])
    return d.strftime(fmt)


def render_line(text, font, width=LINE_IMAGE_WIDTH, height=LINE_IMAGE_HEIGHT):
    """Render a single text line as an image"""
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)

    # Slight random vertical offset for variety
    y_offset = random.randint(5, max(6, height - 40))
    x_offset = random.randint(10, 40)

    draw.text((x_offset, y_offset), text, fill='black', font=font)
    return img


def degrade_image(img, quality):
    """Apply quality degradation"""
    if quality == 'high':
        # Minor variations only
        if random.random() > 0.5:
            factor = random.uniform(0.9, 1.1)
            img = ImageEnhance.Brightness(img).enhance(factor)
        return img

    if quality == 'medium':
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.5)))
        angle = random.uniform(-2, 2)
        img = img.rotate(angle, fillcolor='white', expand=False)
        arr = np.array(img)
        noise = np.random.normal(0, 5, arr.shape)
        arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
        return Image.fromarray(arr)

    # low quality
    img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(1.5, 3.0)))
    angle = random.uniform(-4, 4)
    img = img.rotate(angle, fillcolor='white', expand=False)
    arr = np.array(img)
    noise = np.random.normal(0, 12, arr.shape)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def pick_quality():
    return random.choices(['high', 'medium', 'low'], weights=QUALITY_WEIGHTS)[0]


def generate_line_dataset(num_prescriptions=NUM_PRESCRIPTIONS):
    """Generate line-level training data from synthetic prescriptions"""
    script_dir = Path(__file__).parent
    output_dir = script_dir.parent / "training_data"
    labels_dir = output_dir / "labels"

    # Clean existing
    if output_dir.exists():
        print("Cleaning existing line data...")
        for f in output_dir.glob("line_*.png"):
            f.unlink()
        if labels_dir.exists():
            for f in labels_dir.glob("line_*.txt"):
                f.unlink()

    output_dir.mkdir(parents=True, exist_ok=True)
    labels_dir.mkdir(parents=True, exist_ok=True)

    fonts = load_fonts()
    line_count = 0
    quality_counts = {'high': 0, 'medium': 0, 'low': 0}

    print(f"Generating line-level data from {num_prescriptions} prescriptions...")
    print(f"Output: {output_dir}")
    print()

    for rx_idx in range(1, num_prescriptions + 1):
        # Generate random prescription content
        patient = random.choice(PATIENT_NAMES)
        doctor = random.choice(DOCTOR_NAMES)
        hospital = random.choice(HOSPITALS)
        date = random_date()
        age = random.randint(18, 80)
        num_meds = random.randint(1, 5)

        # Build list of (text, font_key) tuples for this prescription
        lines = []
        lines.append((hospital, 'large'))
        lines.append((f"Patient Name: {patient}", 'normal'))
        lines.append((f"Age: {age} years", 'normal'))
        lines.append((f"Date: {date}", 'normal'))
        lines.append((f"Doctor: {doctor}", 'normal'))
        lines.append(("Rx", 'medium'))

        for mi in range(1, num_meds + 1):
            med = random.choice(MEDICINES)
            dosage = random.choice(med["dosages"])
            form = random.choice(med["forms"])
            freq = random.choice(FREQUENCIES)
            dur = random.choice(DURATIONS)

            lines.append((f"{mi}. {med['name']} {dosage} {form}", 'normal'))
            lines.append((f"   {freq}", 'small'))
            lines.append((f"   Duration: {dur}", 'small'))

        lines.append((f"Signature: {doctor}", 'normal'))

        # Render each line as separate image
        quality = pick_quality()
        quality_counts[quality] += 1

        for text, font_key in lines:
            line_count += 1
            line_id = f"{line_count:06d}"

            img = render_line(text, fonts[font_key])
            img = degrade_image(img, quality)

            img.save(output_dir / f"line_{line_id}.png")
            (labels_dir / f"line_{line_id}.txt").write_text(text.strip(), encoding='utf-8')

        if rx_idx % 50 == 0:
            print(f"   Processed {rx_idx}/{num_prescriptions} prescriptions ({line_count} lines so far)...")

    print()
    print(f"Generation complete!")
    print(f"   Total prescriptions: {num_prescriptions}")
    print(f"   Total line images:   {line_count}")
    print(f"   Quality: high={quality_counts['high']}, medium={quality_counts['medium']}, low={quality_counts['low']}")
    print(f"   Saved to: {output_dir}")
    return line_count


if __name__ == "__main__":
    print("=" * 60)
    print("LINE-LEVEL TRAINING DATA GENERATOR")
    print("=" * 60)
    print()
    generate_line_dataset(NUM_PRESCRIPTIONS)
