"""
PaddleOCR Recognition Training Data Generator
==============================================
Generates line-level text images + label files in PaddleOCR format.
PaddleOCR rec training expects:
  - A directory of cropped text line images
  - A label file: image_path\tlabel_text (one per line)
  - A dictionary file (character set)
"""

import random
from pathlib import Path
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

# Configuration
NUM_PRESCRIPTIONS = 500  # ~8000 line images
LINE_IMAGE_WIDTH = 800
LINE_IMAGE_HEIGHT = 60

QUALITY_WEIGHTS = [0.50, 0.30, 0.20]  # high, medium, low

# ==================== PRESCRIPTION DATA ====================

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
    {"name": "Tramadol", "dosages": ["50mg", "100mg"], "forms": ["Tablet", "Tab"]},
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


# ==================== FONT LOADING ====================

def load_fonts():
    """Load multiple font families for diversity"""
    font_families = [
        "arial.ttf", "times.ttf", "cour.ttf", "verdana.ttf",
        "calibri.ttf", "cambria.ttc", "georgia.ttf", "tahoma.ttf",
        "trebuc.ttf", "comic.ttf", "consola.ttf", "segoeui.ttf",
    ]
    linux_fonts = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]

    sizes = {'large': 36, 'medium': 28, 'normal': 24, 'small': 20}
    available_fonts = []

    for font_name in font_families:
        try:
            ImageFont.truetype(font_name, 24)
            available_fonts.append(font_name)
        except OSError:
            continue

    if not available_fonts:
        for font_path in linux_fonts:
            try:
                ImageFont.truetype(font_path, 24)
                available_fonts.append(font_path)
            except OSError:
                continue

    if not available_fonts:
        return [{ key: ImageFont.load_default() for key in sizes }]

    print(f"   Found {len(available_fonts)} fonts: {available_fonts}")
    all_font_sets = []
    for font_name in available_fonts:
        font_set = {}
        for key, size in sizes.items():
            try:
                font_set[key] = ImageFont.truetype(font_name, size)
            except OSError:
                font_set[key] = ImageFont.load_default()
        all_font_sets.append(font_set)
    return all_font_sets


# ==================== IMAGE RENDERING ====================

def random_date():
    days_ago = random.randint(0, 30)
    d = datetime.now() - timedelta(days=days_ago)
    fmt = random.choice(["%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"])
    return d.strftime(fmt)


def render_line(text, font, width=LINE_IMAGE_WIDTH, height=LINE_IMAGE_HEIGHT):
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    y_offset = random.randint(5, max(6, height - 40))
    x_offset = random.randint(10, 40)
    draw.text((x_offset, y_offset), text, fill='black', font=font)
    return img


def degrade_image(img, quality):
    if quality == 'high':
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


# ==================== MAIN GENERATOR ====================

def generate_paddleocr_dataset(num_prescriptions=NUM_PRESCRIPTIONS):
    """Generate training data in PaddleOCR recognition format."""
    base_dir = Path(__file__).parent.parent
    train_dir = base_dir / "training_data" / "train"
    val_dir = base_dir / "training_data" / "val"

    # Clean existing
    for d in [train_dir, val_dir]:
        if d.exists():
            for f in d.glob("*.png"):
                f.unlink()
        d.mkdir(parents=True, exist_ok=True)

    font_sets = load_fonts()
    all_samples = []  # (filename, label_text)

    print(f"Generating PaddleOCR training data from {num_prescriptions} prescriptions...")
    print(f"Using {len(font_sets)} font families")
    print()

    line_count = 0
    quality_counts = {'high': 0, 'medium': 0, 'low': 0}

    for rx_idx in range(1, num_prescriptions + 1):
        patient = random.choice(PATIENT_NAMES)
        doctor = random.choice(DOCTOR_NAMES)
        hospital = random.choice(HOSPITALS)
        date = random_date()
        age = random.randint(18, 80)
        num_meds = random.randint(1, 5)

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

        quality = pick_quality()
        quality_counts[quality] += 1
        fonts = random.choice(font_sets)

        for text, font_key in lines:
            line_count += 1
            filename = f"line_{line_count:06d}.png"
            img = render_line(text, fonts[font_key])
            img = degrade_image(img, quality)
            # Save to train_dir initially, val split moves files later
            img.save(train_dir / filename)
            all_samples.append((filename, text.strip()))

        if rx_idx % 100 == 0:
            print(f"   {rx_idx}/{num_prescriptions} prescriptions ({line_count} lines)")

    # Shuffle and split 90/10
    random.seed(42)
    random.shuffle(all_samples)
    split_idx = int(0.9 * len(all_samples))
    train_samples = all_samples[:split_idx]
    val_samples = all_samples[split_idx:]

    # Move val images to val_dir
    for filename, _ in val_samples:
        src = train_dir / filename
        dst = val_dir / filename
        if src.exists():
            src.rename(dst)

    # Write label files in PaddleOCR format: image_path\tlabel
    train_label_file = base_dir / "training_data" / "train_label.txt"
    val_label_file = base_dir / "training_data" / "val_label.txt"

    with open(train_label_file, 'w', encoding='utf-8') as f:
        for filename, label in train_samples:
            f.write(f"train/{filename}\t{label}\n")

    with open(val_label_file, 'w', encoding='utf-8') as f:
        for filename, label in val_samples:
            f.write(f"val/{filename}\t{label}\n")

    # Build character dictionary
    all_chars = set()
    for _, label in all_samples:
        all_chars.update(label)
    dict_file = base_dir / "training_data" / "en_dict.txt"
    with open(dict_file, 'w', encoding='utf-8') as f:
        for ch in sorted(all_chars):
            f.write(f"{ch}\n")

    print(f"\nGeneration complete!")
    print(f"   Total lines:  {line_count}")
    print(f"   Train:        {len(train_samples)}")
    print(f"   Validation:   {len(val_samples)}")
    print(f"   Dictionary:   {len(all_chars)} characters")
    print(f"   Quality: high={quality_counts['high']}, medium={quality_counts['medium']}, low={quality_counts['low']}")
    print(f"   Labels: {train_label_file}")
    print(f"   Dict:   {dict_file}")
    return line_count


if __name__ == "__main__":
    print("=" * 60)
    print("PaddleOCR TRAINING DATA GENERATOR")
    print("=" * 60)
    print()
    generate_paddleocr_dataset()
