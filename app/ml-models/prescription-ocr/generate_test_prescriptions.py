"""
Generate test prescription images in different formats for OCR testing.

Usage:
    python generate_test_prescriptions.py              # generates 10 prescriptions (default)
    python generate_test_prescriptions.py --count 20   # generates 20 prescriptions
    python generate_test_prescriptions.py --output my_tests  # custom output folder

Output: test_prescriptions/ folder with PNG images + ground_truth.txt
"""

import argparse
import os
import random
import sys
from datetime import datetime, timedelta
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance
import numpy as np

# ==================== DATA ====================

PATIENT_NAMES = [
    "John Silva", "Maria Perera", "Kasun Fernando", "Dilini Rajapaksa",
    "Nimal De Silva", "Sanduni Wickramasinghe", "Chaminda Jayawardena",
    "Thilini Dissanayake", "Nuwan Bandara", "Rohan Gamage",
    "Prasanna Mendis", "Ayesha Pathirana", "Lakmal Rathnayake",
    "Ishara Rodrigo", "Nadeesha Wickremasinghe", "Sameera Pathirana",
    "Kusal Rajapakse", "Asanka Herath", "Gayan Liyanage",
    "David Anderson", "Sarah Johnson", "Michael Chen", "Emily Williams",
    "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy",
]

DOCTOR_NAMES = [
    "Dr. A. Fernando", "Dr. K. Perera", "Dr. S. Silva",
    "Dr. M. Gunawardena", "Dr. R. Jayasinghe", "Dr. N. Dissanayake",
    "Dr. Chandana Wijesuriya", "Dr. Lakshmi Fernando",
    "Dr. Sarah Chen", "Dr. Michael Thompson", "Dr. Priya Sharma",
    "Dr. David Anderson", "Dr. Emily Williams",
]

HOSPITALS = [
    "Lanka Hospital", "Nawaloka Hospital", "Asiri Medical Center",
    "Durdans Hospital", "Central Hospital", "City Medical Center",
    "National Hospital", "Hemas Hospital", "Royal Hospital",
    "St. Michael's Medical Center", "Sunshine Medical Center",
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
    {"name": "Ibuprofen", "dosages": ["200mg", "400mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Ciprofloxacin", "dosages": ["250mg", "500mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Pantoprazole", "dosages": ["20mg", "40mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Diclofenac", "dosages": ["25mg", "50mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Prednisolone", "dosages": ["5mg", "10mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Sertraline", "dosages": ["50mg", "100mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Metoprolol", "dosages": ["25mg", "50mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Folic Acid", "dosages": ["5mg"], "forms": ["Tablet", "Tab"]},
    {"name": "Vitamin D3", "dosages": ["1000IU", "2000IU"], "forms": ["Capsule", "Cap"]},
    {"name": "Gabapentin", "dosages": ["100mg", "300mg"], "forms": ["Capsule", "Cap"]},
]

FREQUENCIES = [
    "1-0-1 (Twice daily)", "1-1-1 (Three times daily)",
    "0-0-1 (Once daily at night)", "1-0-0 (Once daily in morning)",
    "Twice daily", "Three times daily", "As needed",
    "Every 6 hours", "Every 8 hours", "Every 12 hours",
    "Before meals", "After meals",
]

DURATIONS = [
    "5 days", "7 days", "10 days", "14 days", "1 month",
    "3 days", "21 days", "2 weeks", "30 days",
]

QUALITIES = ["high", "medium", "low"]

# ==================== HELPERS ====================


def random_date():
    days_ago = random.randint(0, 60)
    d = datetime.now() - timedelta(days=days_ago)
    fmt = random.choice(["%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"])
    return d.strftime(fmt)


def load_font(size: int):
    """Try to load a system font, fall back to default."""
    candidates = [
        "arial.ttf", "calibri.ttf", "consola.ttf", "times.ttf",
        "verdana.ttf", "tahoma.ttf", "cour.ttf", "segoeui.ttf",
        # Linux
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def degrade_image(img: Image.Image, quality: str) -> Image.Image:
    """Apply quality degradation to simulate real-world scanning."""
    if quality == "high":
        if random.random() > 0.5:
            factor = random.uniform(0.92, 1.08)
            img = ImageEnhance.Brightness(img).enhance(factor)
        return img

    if quality == "medium":
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.4, 1.2)))
        angle = random.uniform(-1.5, 1.5)
        img = img.rotate(angle, fillcolor="white", expand=False)
        arr = np.array(img)
        noise = np.random.normal(0, 4, arr.shape)
        arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
        return Image.fromarray(arr)

    # low quality
    img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(1.2, 2.5)))
    angle = random.uniform(-3, 3)
    img = img.rotate(angle, fillcolor="white", expand=False)
    arr = np.array(img)
    noise = np.random.normal(0, 10, arr.shape)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def pick_meds(count: int) -> list[dict]:
    """Pick random medications with details."""
    meds = random.sample(MEDICINES, min(count, len(MEDICINES)))
    result = []
    for med in meds:
        result.append({
            "name": med["name"],
            "dosage": random.choice(med["dosages"]),
            "form": random.choice(med["forms"]),
            "frequency": random.choice(FREQUENCIES),
            "duration": random.choice(DURATIONS),
        })
    return result


# ==================== PRESCRIPTION FORMATS ====================
# These match the 3 parsing formats in api_service.py


def format_a_lines(meds: list[dict]) -> list[str]:
    """
    Format A: Numbered medications with dosage+form on the SAME line.
    Frequency and duration on subsequent indented lines.
    e.g.  1. Paracetamol 500mg Tab
              1-1-1 (Three times daily)
              Duration: 7 days
    """
    lines = []
    for i, med in enumerate(meds, 1):
        lines.append(f"{i}. {med['name']} {med['dosage']} {med['form']}")
        lines.append(f"   {med['frequency']}")
        lines.append(f"   Duration: {med['duration']}")
    return lines


def format_b_lines(meds: list[dict]) -> list[str]:
    """
    Format B: Numbered medication name, then Dose/frequency/duration on next lines.
    e.g.  1. Amoxicillin
          Dose: 500mg Capsule
          Every 8 hours
          Duration: 10 days
    """
    lines = []
    for i, med in enumerate(meds, 1):
        lines.append(f"{i}. {med['name']}")
        lines.append(f"   Dose: {med['dosage']} {med['form']}")
        lines.append(f"   {med['frequency']}")
        lines.append(f"   Duration: {med['duration']}")
    return lines


def format_c_lines(meds: list[dict]) -> list[str]:
    """
    Format C: No numbering — standalone medicine name, then Dose line.
    e.g.  Metformin
          Dose: 500mg Tablet
          1-0-1 (Twice daily)
          Duration: 14 days
    """
    lines = []
    for med in meds:
        lines.append(med["name"])
        lines.append(f"Dose: {med['dosage']} {med['form']}")
        lines.append(f"{med['frequency']}")
        lines.append(f"Duration: {med['duration']}")
        lines.append("")  # blank line separator
    return lines


FORMAT_FUNCS = {
    "A": format_a_lines,
    "B": format_b_lines,
    "C": format_c_lines,
}


# ==================== HEADER/FOOTER VARIATIONS ====================


def header_v1(hospital, patient, doctor, date, age):
    """Standard header with all fields labeled."""
    return [
        hospital,
        "",
        f"Patient Name: {patient}",
        f"Age: {age} years",
        f"Date: {date}",
        f"Doctor: {doctor}",
        "",
        "Rx",
        "",
    ]


def header_v2(hospital, patient, doctor, date, age):
    """Compact header — fewer labels."""
    return [
        hospital,
        f"Date: {date}",
        "",
        f"Patient: {patient}       Age: {age}",
        f"Doctor: {doctor}",
        "",
        "Rx",
        "",
    ]


def header_v3(hospital, patient, doctor, date, age):
    """Minimal — no hospital, just patient + date at top."""
    return [
        f"Patient Name: {patient}",
        f"Age: {age} years       Date: {date}",
        "",
        "Medications:",
        "",
    ]


HEADER_FUNCS = [header_v1, header_v2, header_v3]


def footer_v1(doctor):
    return ["", f"Signature: {doctor}"]


def footer_v2(doctor):
    return ["", f"Dr. {doctor.replace('Dr. ', '')}"]


def footer_v3(doctor):
    return ["", "---", f"Prescribed by: {doctor}"]


FOOTER_FUNCS = [footer_v1, footer_v2, footer_v3]


# ==================== RENDERING ====================


def render_prescription(text_lines: list[str], quality: str) -> Image.Image:
    """Render a full-page prescription image from text lines."""
    width = 800
    margin_x = 40
    margin_y = 30
    line_spacing = 8

    # Load fonts
    font_normal = load_font(22)
    font_header = load_font(28)
    font_small = load_font(18)

    # Calculate height
    y = margin_y
    line_heights = []
    for line in text_lines:
        if not line.strip():
            h = 12
        elif line == text_lines[0] and len(line) > 3:
            h = 34
        elif line.startswith("   "):
            h = 24
        else:
            h = 28
        line_heights.append(h)
        y += h + line_spacing
    height = y + margin_y

    # Create image
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)

    # Optional: light border
    if random.random() > 0.4:
        draw.rectangle([5, 5, width - 6, height - 6], outline="#cccccc", width=1)

    # Draw lines
    y = margin_y
    for i, line in enumerate(text_lines):
        if not line.strip():
            y += 12 + line_spacing
            continue

        # First line (hospital) — larger font, centered
        if i == 0 and len(line) > 3 and not line.startswith(" "):
            bbox = draw.textbbox((0, 0), line, font=font_header)
            tw = bbox[2] - bbox[0]
            x = max(margin_x, (width - tw) // 2)
            draw.text((x, y), line, fill="black", font=font_header)
            y += 34 + line_spacing
            continue

        # Indented lines — smaller font
        if line.startswith("   "):
            draw.text((margin_x + 30, y), line.strip(), fill="#333333", font=font_small)
            y += 24 + line_spacing
            continue

        # Normal lines
        draw.text((margin_x, y), line, fill="black", font=font_normal)
        y += 28 + line_spacing

    # Degrade
    img = degrade_image(img, quality)
    return img


# ==================== MAIN GENERATOR ====================


def generate_prescription(idx: int) -> tuple[Image.Image, dict]:
    """Generate one prescription image + ground truth metadata."""
    patient = random.choice(PATIENT_NAMES)
    doctor = random.choice(DOCTOR_NAMES)
    hospital = random.choice(HOSPITALS)
    date = random_date()
    age = random.randint(18, 85)
    num_meds = random.randint(1, 5)
    quality = random.choice(QUALITIES)

    # Pick a format
    fmt_key = random.choice(["A", "B", "C"])
    meds = pick_meds(num_meds)

    # Build text
    header_fn = random.choice(HEADER_FUNCS)
    footer_fn = random.choice(FOOTER_FUNCS)

    header = header_fn(hospital, patient, doctor, date, age)
    med_lines = FORMAT_FUNCS[fmt_key](meds)
    footer = footer_fn(doctor)

    all_lines = header + med_lines + footer

    # Render
    img = render_prescription(all_lines, quality)

    # Ground truth
    ground_truth = {
        "index": idx,
        "format": fmt_key,
        "quality": quality,
        "patient": patient,
        "doctor": doctor,
        "hospital": hospital,
        "date": date,
        "age": age,
        "medications": [
            {
                "name": f"{m['name']} {m['dosage']} {m['form']}",
                "dosage": m["dosage"],
                "frequency": m["frequency"],
                "duration": m["duration"],
            }
            for m in meds
        ],
        "full_text": "\n".join(all_lines),
    }

    return img, ground_truth


def main():
    parser = argparse.ArgumentParser(description="Generate test prescription images")
    parser.add_argument("--count", type=int, default=10, help="Number of prescriptions")
    parser.add_argument("--output", type=str, default="test_prescriptions",
                        help="Output directory name")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)
        np.random.seed(args.seed)

    script_dir = Path(__file__).parent
    output_dir = script_dir / args.output
    output_dir.mkdir(parents=True, exist_ok=True)

    gt_lines = []
    format_counts = {"A": 0, "B": 0, "C": 0}
    quality_counts = {"high": 0, "medium": 0, "low": 0}

    print(f"Generating {args.count} test prescriptions → {output_dir}/\n")

    for i in range(1, args.count + 1):
        img, gt = generate_prescription(i)
        fname = f"prescription_{i:04d}_{gt['format']}_{gt['quality']}.png"
        img.save(output_dir / fname)

        format_counts[gt["format"]] += 1
        quality_counts[gt["quality"]] += 1

        # Ground truth line
        med_summary = "; ".join(m["name"] for m in gt["medications"])
        gt_lines.append(
            f"{fname}\t"
            f"format={gt['format']}\t"
            f"quality={gt['quality']}\t"
            f"patient={gt['patient']}\t"
            f"doctor={gt['doctor']}\t"
            f"meds={med_summary}"
        )

        print(f"  [{i:3d}/{args.count}] {fname}  "
              f"({len(gt['medications'])} meds, format {gt['format']}, {gt['quality']})")

    # Write ground truth file
    gt_path = output_dir / "ground_truth.txt"
    with open(gt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(gt_lines) + "\n")

    # Write full text for each prescription (for debugging)
    for i in range(1, args.count + 1):
        # Re-generate with same seed if needed — but we already saved the image
        pass

    print(f"\nDone!")
    print(f"  Images:  {args.count}")
    print(f"  Formats: A={format_counts['A']}, B={format_counts['B']}, C={format_counts['C']}")
    print(f"  Quality: high={quality_counts['high']}, medium={quality_counts['medium']}, low={quality_counts['low']}")
    print(f"  Ground truth: {gt_path}")
    print(f"\nTo test with the API:")
    print(f'  curl -X POST http://localhost:8000/ocr -F "file=@{output_dir}/prescription_0001_A_high.png"')


if __name__ == "__main__":
    main()
