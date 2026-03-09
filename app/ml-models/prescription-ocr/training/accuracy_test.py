"""Quick accuracy test on 10 random prescription images."""
import torch, random, re
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
from pathlib import Path
import numpy as np, cv2

processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained("../model")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device).eval()

def proj_lines(binary, image, pct):
    h = np.sum(binary, axis=1)
    if h.max() == 0:
        return []
    t = max(200, h.max() * pct)
    rows = h > t
    lines = []
    st = 0
    il = False
    for i in range(len(rows)):
        if rows[i] and not il:
            st = i; il = True
        elif not rows[i] and il:
            if i - st >= 8:
                lines.append((st, i))
            il = False
    if il and len(rows) - st >= 8:
        lines.append((st, len(rows)))
    return [image.crop((0, max(0, s - 6), image.width, min(image.height, e + 6))) for s, e in lines]

def detect(image):
    arr = np.array(image)
    g = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    _, b = cv2.threshold(g, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    r = []
    # contour
    k = cv2.getStructuringElement(cv2.MORPH_RECT, (image.width // 4, 5))
    d = cv2.dilate(b, k, iterations=1)
    cs, _ = cv2.findContours(d, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bx = sorted(
        [(x, y, w, h) for c in cs for x, y, w, h in [cv2.boundingRect(c)]
         if w >= image.width * 0.05 and 10 <= h <= image.height * 0.3],
        key=lambda b: b[1],
    )
    mr = []
    for x, y, w, h in bx:
        if mr:
            px, py, pw, ph = mr[-1]
            ov = min(py + ph, y + h) - max(py, y)
            if ov > 0.5 * min(ph, h):
                mr[-1] = (min(px, x), min(py, y), max(px + pw, x + w) - min(px, x), max(py + ph, y + h) - min(py, y))
                continue
        mr.append((x, y, w, h))
    r.append([image.crop((max(0, x - 8), max(0, y - 8), min(image.width, x + w + 8), min(image.height, y + h + 8))) for x, y, w, h in mr])
    # proj clean
    kc = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    r.append(proj_lines(cv2.morphologyEx(b, cv2.MORPH_OPEN, kc), image, 0.05))
    # proj fixed
    _, bf = cv2.threshold(g, 128, 255, cv2.THRESH_BINARY_INV)
    r.append(proj_lines(bf, image, 0.02))
    best = max(r, key=lambda x: len(x) if 5 <= len(x) <= 30 else 0)
    if len(best) < 5:
        best = max(r, key=len)
    return best

def ocr(li):
    pv = processor(li, return_tensors="pt").pixel_values.to(device)
    with torch.no_grad():
        ids = model.generate(pv, max_length=64, num_beams=4, early_stopping=True)
    return processor.batch_decode(ids, skip_special_tokens=True)[0].strip()

data = Path("../test_data")
labels = data / "labels"
imgs = sorted(list(data.glob("prescription_*.png")))
random.seed(42)
test = random.sample(imgs, 10)

stats = {"hospital": 0, "patient": 0, "date": 0, "total": 10}
for ip in test:
    parts = ip.stem.split("_")
    lf = labels / f"prescription_{parts[1]}.txt"
    gt = lf.read_text(encoding="utf-8").strip() if lf.exists() else ""
    gtl = [l.strip() for l in gt.split("\n") if l.strip()]
    gt_hosp = gtl[0] if gtl else ""
    gt_pat = ""
    gt_date = ""
    for l in gtl:
        if "Patient Name:" in l:
            gt_pat = l.replace("Patient Name:", "").strip()
        m = re.search(r"Date:\s*(.+)", l)
        if m:
            gt_date = m.group(1).strip()

    img = Image.open(ip).convert("RGB")
    lines = detect(img)
    texts = [ocr(l) for l in lines]

    pred_hosp = texts[0] if texts else ""
    pred_pat = ""
    pred_date = ""
    for t in texts:
        if "Patient" in t and ":" in t:
            pred_pat = t.split(":")[-1].strip()
        dm = re.search(r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", t)
        if dm and not pred_date:
            pred_date = dm.group(1)

    h_ok = gt_hosp.lower()[:10] == pred_hosp.lower()[:10] if gt_hosp and pred_hosp else False
    p_ok = gt_pat.lower() == pred_pat.lower() if gt_pat else False
    d_ok = gt_date == pred_date if gt_date else False

    stats["hospital"] += int(h_ok)
    stats["patient"] += int(p_ok)
    stats["date"] += int(d_ok)

    q = ip.stem.split("_")[-1]
    h_s = "OK" if h_ok else "FAIL"
    p_s = "OK" if p_ok else "FAIL"
    d_s = "OK" if d_ok else "FAIL"
    print(f"{ip.name} ({q}): lines={len(lines)} hosp={h_s} pat={p_s} date={d_s}")

print(f"\n=== ACCURACY (10 images) ===")
print(f"Hospital: {stats['hospital']}/10 = {stats['hospital']*10}%")
print(f"Patient:  {stats['patient']}/10 = {stats['patient']*10}%")
print(f"Date:     {stats['date']}/10 = {stats['date']*10}%")
