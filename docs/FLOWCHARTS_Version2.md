# System Flowcharts & Diagrams
## AI-Enhanced Pharmacy Management System

**Version**: 1.0.0  
**Date**: October 20, 2025  
**Developer**: @idsithija

---

## Table of Contents
1. [User Authentication Flow](#user-authentication-flow)
2. [AI Prescription Scanning Flow](#ai-prescription-scanning-flow)
3. [Sales Transaction Flow](#sales-transaction-flow)
4. [Inventory Management Flow](#inventory-management-flow)
5. [Drug Interaction Check Flow](#drug-interaction-check-flow)
6. [Inventory Prediction Flow](#inventory-prediction-flow)
7. [Medicine Search Flow](#medicine-search-flow)
8. [User Journey Maps](#user-journey-maps)

---

## 1. User Authentication Flow

### Registration Flow

```
START
  ↓
[User visits /register page]
  ↓
User fills registration form:
  - Username
  - Email
  - Password
  - Role (customer default)
  - First Name, Last Name
  - Phone
  ↓
[Frontend Validation]
  ├─→ Invalid? → Show error → User corrects
  └─→ Valid? ↓
  ↓
POST /api/auth/register
  ↓
[Backend receives request]
  ↓
[Validation Middleware]
  - Check email format
  - Check password strength
  - Check username uniqueness
  ├─→ Invalid? → Return 400 error
  └─→ Valid? ↓
  ↓
[authController.register()]
  ↓
Check if email exists in database
  ├─→ Yes? → Return 409 (Conflict)
  └─→ No? ↓
  ↓
Hash password (bcrypt, 10 rounds)
  ↓
Create User record in database
  ↓
If role = 'customer':
  Create Customer record
  ↓
Generate JWT token
  - Payload: { id, username, role }
  - Expires: 7 days
  ↓
Return Response:
{
  success: true,
  token: "jwt_token_here",
  user: {
    id, username, email, role, firstName, lastName
  }
}
  ↓
[Frontend receives response]
  ↓
Store token in localStorage
  ↓
Redirect to dashboard
  ↓
END
```

### Login Flow

```
START
  ↓
[User visits /login page]
  ↓
User enters credentials:
  - Email/Username
  - Password
  ↓
[Frontend Validation]
  ├─→ Empty fields? → Show error
  └─→ Valid? ↓
  ↓
POST /api/auth/login
  ↓
[Backend receives request]
  ↓
[authController.login()]
  ↓
Find user by email/username
  ├─→ Not found? → Return 401 (Invalid credentials)
  └─→ Found? ↓
  ↓
Check if user.isActive
  ├─→ No? → Return 403 (Account disabled)
  └─→ Yes? ↓
  ↓
Validate password (bcrypt.compare)
  ├─→ Invalid? → Return 401 (Invalid credentials)
  └─→ Valid? ↓
  ↓
Update user.lastLogin
  ↓
Generate JWT token
  ↓
Create AuditLog entry
  - action: 'LOGIN'
  - userId, ipAddress, userAgent
  ↓
Return Response:
{
  success: true,
  token: "jwt_token_here",
  user: { id, username, email, role, firstName, lastName }
}
  ↓
[Frontend receives response]
  ↓
Store token in localStorage
  ↓
Setup axios interceptor with token
  ↓
Redirect based on role:
  - admin → /admin/dashboard
  - pharmacist → /pharmacist/dashboard
  - customer → /customer/dashboard
  ↓
END
```

### Protected Route Flow

```
User navigates to protected page
  ↓
[React PrivateRoute component]
  ↓
Check localStorage for token
  ├─→ No token? → Redirect to /login
  └─→ Has token? ↓
  ↓
Verify token is not expired (frontend check)
  ├─→ Expired? → Redirect to /login
  └─→ Valid? ↓
  ↓
Make API request with token in header:
Authorization: Bearer <token>
  ↓
[Backend auth.middleware.js]
  ↓
Extract token from header
  ├─→ No token? → Return 401
  └─→ Has token? ↓
  ↓
Verify JWT signature
  ├─→ Invalid? → Return 401
  └─→ Valid? ↓
  ↓
Decode JWT payload
  ↓
Find user by ID from payload
  ├─→ Not found? → Return 401
  └─→ Found? ↓
  ↓
Check if user.isActive
  ├─→ No? → Return 403
  └─→ Yes? ↓
  ↓
Attach user to request object:
req.user = user
  ↓
Check role permissions (if needed)
  ├─→ No permission? → Return 403
  └─→ Has permission? ↓
  ↓
Continue to controller
  ↓
Process request
  ↓
Return response
```

---

## 2. AI Prescription Scanning Flow

### Complete Prescription Processing

```
START (Pharmacist/Customer)
  ↓
[Navigate to /prescriptions/scan page]
  ↓
Click "Upload Prescription" or "Take Photo"
  ↓
┌─────────────────────────────────────┐
│  IF USING CAMERA                    │
├─────────────────────────────────────┤
│ Request camera permission           │
│ User allows/denies                  │
│   ├─→ Denied? → Show upload option │
│   └─→ Allowed? ↓                   │
│ Display camera preview              │
│ User positions prescription         │
│ Click "Capture"                     │
│ Show preview of captured image      │
│ Confirm or Retake                   │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  IF UPLOADING FILE                  │
├─────────────────────────────────────┤
│ Open file picker                    │
│ User selects image file             │
│   (jpg, png, pdf)                   │
│ Frontend validation:                │
│   - File size < 5MB                 │
│   - File type allowed               │
│   ├─→ Invalid? → Show error        │
│   └─→ Valid? ↓                     │
│ Show image preview                  │
└─────────────────────────────────────┘
  ↓
User clicks "Scan Prescription"
  ↓
[Frontend shows loading spinner]
  ↓
Create FormData object:
  formData.append('prescription', imageFile)
  formData.append('customerId', customerId)
  ↓
POST /api/ai/scan-prescription
  (Content-Type: multipart/form-data)
  ↓
═══════════════════════════════════════
      BACKEND PROCESSING BEGINS
═══════════════════════════════════════
  ↓
[upload.middleware.js - Multer]
  ↓
Validate file:
  - Check file type
  - Check file size
  - Generate unique filename
  ├─→ Invalid? → Return 400 error
  └─→ Valid? ↓
  ↓
Save file to:
  ./uploads/prescriptions/[uniqueFilename]
  ↓
Add file info to req.file
  ↓
[aiController.scanPrescription()]
  ↓
Get file path: req.file.path
Get customer ID: req.body.customerId
  ↓
═══════════════════════════════════════
        STEP 1: OCR PROCESSING
═══════════════════════════════════════
  ↓
Call: ocrService.extractText(filePath)
  ↓
[ocrService.js]
  ↓
Preprocess image using sharp:
  - Convert to grayscale
  - Increase contrast
  - Sharpen edges
  - Remove noise
  - Enhance readability
  ↓
Save processed image:
  processed_[filename]
  ↓
Initialize Tesseract.js worker
  ↓
Tesseract.recognize(processedImage, 'eng')
  ↓
[Tesseract processes image...]
  - Character recognition
  - Word detection
  - Line detection
  - Confidence scoring
  ↓
Extract results:
{
  text: "full extracted text",
  confidence: 92.5,
  words: [{text, confidence, bbox}...],
  lines: [{text, confidence}...]
}
  ↓
Return OCR result
  ↓
═══════════════════════════════════════
        STEP 2: NLP PROCESSING
═══════════════════════════════════════
  ↓
Call: nlpService.parsePrescription(ocrText)
  ↓
[nlpService.js]
  ↓
Split text into lines
  ↓
Extract Doctor Information:
  - Pattern: /Dr\.?\s+([A-Z][a-z]+)/
  - Scan for "Dr." or "Physician:"
  - Extract name
  ↓
Extract Patient Information:
  - Pattern: /Patient:\s*([A-Z][a-z]+)/
  - Extract patient name
  ↓
Extract Date:
  - Pattern: /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/
  - Parse date
  ↓
Extract Medicines:
  For each line:
    ↓
    Pattern Match:
    - Tab. [MedicineName] [Dosage]
    - Cap. [MedicineName] [Dosage]
    - Syp. [MedicineName] [Dosage]
    ↓
    Extract:
    {
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: extracted from context,
      duration: extracted from context,
      instructions: full line text
    }
    ↓
    Check next 2-3 lines for:
    - Frequency: "twice daily", "BD", "TID"
    - Duration: "7 days", "2 weeks"
    - Special instructions
  ↓
Return parsed data:
{
  doctorName: "Dr. Smith",
  patientName: "John Doe",
  date: "2025-10-20",
  medicines: [
    {
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "2 times per day",
      duration: "7 days",
      instructions: "Take after meals"
    },
    ...
  ]
}
  ↓
═══════════════════════════════════════
    STEP 3: MEDICINE VALIDATION
═══════════════════════════════════════
  ↓
For each extracted medicine:
  ↓
  Search in Medicine database:
  - By name (exact match)
  - By generic name
  - By fuzzy match (similarity > 80%)
  ↓
  If found:
    - Link to medicine.id
    - Get full medicine details
    - Check if requires prescription
  ↓
  If not found:
    - Flag as "unrecognized"
    - Suggest similar medicines
    - Require pharmacist review
  ↓
═══════════════════════════════════════
   STEP 4: DRUG INTERACTION CHECK
═══════════════════════════════════════
  ↓
Get all medicine IDs from prescription
  ↓
Get customer's current prescriptions
(active prescriptions from last 30 days)
  ↓
Combine all medicine IDs
  ↓
Call: drugCheckService.checkInteractions(medicineIds)
  ↓
[drugCheckService.js]
  ↓
For each pair of medicines:
  ↓
  Check local DrugInteraction table:
    WHERE (drug1_id = A AND drug2_id = B)
       OR (drug1_id = B AND drug2_id = A)
  ↓
  If found locally:
    Return cached interaction
  ↓
  If not found:
    Query OpenFDA API:
    GET https://api.fda.gov/drug/label.json
    ?search=openfda.generic_name:"[medicineName]"
    ↓
    Parse response
    ↓
    Extract drug_interactions field
    ↓
    Check if other medicine mentioned
    ↓
    If interaction found:
      Determine severity:
      - "contraindicated" → critical
      - "serious" → major
      - "monitor" → moderate
      - else → minor
      ↓
      Save to DrugInteraction table (cache)
      ↓
      Return interaction details:
      {
        drug1: "Amoxicillin",
        drug2: "Warfarin",
        severity: "moderate",
        description: "May increase bleeding risk",
        recommendation: "Monitor closely",
        source: "OpenFDA"
      }
  ↓
Return all interactions found
  ↓
═══════════════════════════════════════
      STEP 5: UPLOAD TO CLOUD
═══════════════════════════════════════
  ↓
Upload original image to Cloudinary:
  cloudinary.uploader.upload(filePath)
  ↓
Get public URL:
  imageUrl = result.secure_url
  ↓
Delete local file:
  fs.unlink(filePath)
  ↓
═══════════════════════════════════════
      STEP 6: SAVE TO DATABASE
═══════════════════════════════════════
  ↓
Start database transaction
  ↓
Create Prescription record:
{
  customerId: customerId,
  doctorName: parsedData.doctorName,
  prescriptionDate: parsedData.date,
  imageUrl: cloudinaryUrl,
  ocrRawText: ocrResult.text,
  ocrConfidence: ocrResult.confidence,
  isVerified: false
}
  ↓
For each medicine in parsedData.medicines:
  Create PrescriptionItem:
  {
    prescriptionId: prescription.id,
    medicineId: matchedMedicine.id,
    medicineName: medicine.name,
    dosage: medicine.dosage,
    frequency: medicine.frequency,
    duration: medicine.duration,
    instructions: medicine.instructions,
    isDispensed: false
  }
  ↓
Commit transaction
  ↓
═══════════════════════════════════════
      STEP 7: RETURN RESPONSE
═══════════════════════════════════════
  ↓
Build response object:
{
  success: true,
  prescription: {
    id: 123,
    imageUrl: "https://cloudinary.com/...",
    ocrConfidence: 92.5,
    doctorName: "Dr. Smith",
    patientName: "John Doe",
    date: "2025-10-20",
    medicines: [
      {
        id: 1,
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "2 times per day",
        duration: "7 days",
        matched: true,
        requiresPrescription: true
      }
    ],
    interactions: [
      {
        severity: "moderate",
        message: "May interact with current medications"
      }
    ],
    warnings: [
      {
        type: "unrecognized_medicine",
        message: "Some medicines could not be identified"
      }
    ],
    needsReview: true
  }
}
  ↓
Return response to frontend
  ↓
═══════════════════════════════════════
      FRONTEND DISPLAYS RESULTS
═══════════════════════════════════════
  ↓
Hide loading spinner
  ↓
Display scanned prescription image
  ↓
Display extracted data in form:
  - Doctor name (editable)
  - Patient name (editable)
  - Date (editable)
  ↓
Display medicines table:
┌────────────────────────────────────┐
│ Medicine | Dosage | Frequency | ✓ │
├────────────────────────────────────┤
│ Amoxicillin 500mg | 2x/day | ☑   │
│ Paracetamol 500mg | 3x/day | ☑   │
└────────────────────────────────────┘
  ↓
Display warnings (if any):
⚠️ Drug Interaction Warning:
   Amoxicillin may interact with Warfarin
   Severity: Moderate
   Recommendation: Monitor closely
  ↓
Display unrecognized medicines:
❌ Could not identify: "Panadl" 
   Did you mean: Panadol?
  ↓
Pharmacist can:
  - Edit any field
  - Add/remove medicines
  - Mark as verified
  - Proceed to billing
  ↓
Click "Verify & Process"