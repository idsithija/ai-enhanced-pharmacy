# 🎴 Demo Quick Reference Card
*Keep this visible during your presentation*

---

## 🔐 LOGIN CREDENTIALS
```
Admin:      admin@pharmacy.com      / admin123
Pharmacist: pharmacist@pharmacy.com / pharmacist123  
Cashier:    cashier@pharmacy.com    / cashier123
```

---

## 🎯 DEMO ORDER (30 min)

### 1️⃣ Introduction (2 min)
- Login as Admin
- Show role-based access

### 2️⃣ Dashboard (3 min)
- Revenue: ~$173
- Low stock: 11 items
- Expiring soon: 3-4 items
- Recent activity

### 3️⃣ AI FEATURES ⭐ (15 min) - MAIN FOCUS

**Drug Interaction Checker (3 min)**
- ✅ Safe: Paracetamol + Cetirizine
- ⚠️ Moderate: Lisinopril + Potassium
- 🚨 Major: Aspirin + Warfarin (or Simvastatin + Gemfibrozil)

**AI Chatbot (3 min)**
- "What is Amoxicillin used for?"
- "I have a headache"
- "What are your hours?"
- "How much is Paracetamol?"

**Demand Prediction (3 min)**
- Show critical stock items (8-25 units)
- Highlight AI recommendations
- Example: Lisinopril (8 units, needs 50)

**Prescription OCR (3 min)**
- Show pending prescriptions (2)
- Show verified (Robert Anderson - Amoxicillin + Omeprazole)
- Explain OCR workflow

**NLP Search (3 min)**
- "pain reliever" → Paracetamol, Ibuprofen
- "Acetaminophen" → Paracetamol (Tylenol)
- "fever medicine" → Paracetamol, Ibuprofen
- "antibiotic" → All antibiotics

### 4️⃣ Core Features (5 min)
- Inventory (30 items, low stock alerts)
- POS (Quick sale demo)
- Customers (8 profiles, loyalty points)
- Prescriptions (4 total: 2 verified, 2 pending)
- Reports (Sales, trends)

### 5️⃣ Admin (2 min)
- Users (3 roles)
- Suppliers (3 suppliers, 4.5-4.8★)
- Purchase Orders (3 orders)

### 6️⃣ Q&A (3 min)

---

## 💬 ANSWER QUICK GUIDE

**"How accurate is demand prediction?"**
→ "ML algorithms analyze historical sales. Improves with more data."

**"What if OCR is wrong?"**
→ "Pharmacist verification required. OCR assists, doesn't replace."

**"Drug interaction database coverage?"**
→ "Major interactions covered. Continuously updated."

**"Can it scale?"**
→ "Yes. Multi-location ready. Cloud deployment capable."

**"Data security?"**
→ "JWT auth, bcrypt passwords, HTTPS, role-based access."

---

## ⚡ DEMO DATA HIGHLIGHTS

- **Medicines:** 30 (10+ categories)
- **Customers:** 8 (95-2100 loyalty points)
- **Sales:** 8 transactions (~$755 total)
- **Prescriptions:** 4 (2 verified, 2 pending)
- **Low Stock:** 11 items below reorder
- **Expiring:** 3-4 items within 60 days
- **Suppliers:** MediSupply (4.8★), HealthWorks (4.5★), PharmaDirect (4.7★)

---

## 🎬 OPENING (30 sec)

*"Good morning! Today I present our AI-Enhanced Pharmacy Management System with 5 AI features: Drug Interaction Checker, AI Chatbot, Demand Prediction, Prescription OCR, and NLP Search. Built with React, TypeScript, Node.js - production-ready with 30 passing tests. Let me show you..."*

---

## 🏁 CLOSING (30 sec)

*"This system delivers: Enhanced patient safety, reduced costs, improved inventory management, better customer service, and streamlined workflows. Fully functional, tested, and deployment-ready. Thank you! Questions?"*

---

## 🚨 EMERGENCY BACKUP

**If live demo fails:**
- Show screenshots
- Walk through code
- Show test coverage (30/30 passing)
- Explain architecture via diagrams
- Reference documentation

---

## ⏱️ TIME CHECK

| 0-2 | 2-5 | 5-20 | 20-25 | 25-27 | 27-30 |
|-----|-----|------|-------|-------|-------|
| Intro | Dashboard | **AI FEATURES** | Core | Admin | Q&A |

---

## ✅ PRE-DEMO CHECKLIST

```bash
# 5 minutes before
cd backend && npm run db:demo && npm run dev
cd frontend && npm run dev
# Test login: admin@pharmacy.com / admin123
# Check dashboard loads
```

---

**🍀 Good Luck! You've got this!**

*Remember: Breathe. You know this system. Speak clearly. Show confidence.*
