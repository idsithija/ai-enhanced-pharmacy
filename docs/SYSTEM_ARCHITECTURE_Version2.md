# System Architecture Document
## AI-Enhanced Pharmacy Management System - Node.js Stack

**Version**: 1.0.0  
**Date**: October 20, 2025  
**Developer**: @idsithija  
**Tech Stack**: Node.js + Express + PostgreSQL + React + Free AI Models

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Node.js Backend Architecture](#nodejs-backend-architecture)
4. [React Frontend Architecture](#react-frontend-architecture)
5. [Data Flow](#data-flow)
6. [AI/ML Architecture (Free Services)](#aiml-architecture-free-services)
7. [Security Architecture](#security-architecture)
8. [API Design](#api-design)
9. [Deployment Architecture](#deployment-architecture)

---

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                   (React.js Web Application)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │ Medicines│  │  Sales   │  │    AI    │       │
│  │   UI     │  │    UI    │  │   UI     │  │ Features │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/REST API (Axios)
┌────────────────────────┴────────────────────────────────────────┐
│                   APPLICATION LAYER                              │
│              (Node.js + Express.js Backend)                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   API Gateway                         │      │
│  │              (Express Router + CORS)                  │      │
│  └─────────────────────┬────────────────────────────────┘      │
│                        │                                         │
│  ┌─────────────────────┴────────────────────────────────┐      │
│  │              Middleware Layer                          │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│      │
│  │  │   Auth   │ │Validation│ │  Upload  │ │  Error  ││      │
│  │  │Middleware│ │Middleware│ │Middleware│ │ Handler ││      │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘│      │
│  └────────────────────────────────────────────────────────      │
│                        │                                         │
│  ┌─────────────────────┴────────────────────────────────┐      │
│  │            Business Logic Layer                        │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│      │
│  │  │  Auth    │ │ Medicine │ │Inventory │ │  Sales  ││      │
│  │  │Controller│ │Controller│ │Controller│ │Controller│      │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘│      │
│  └────────────────────────────────────────────────────────      │
│                        │                                         │
│  ┌─────────────────────┴────────────────────────────────┐      │
│  │             AI Services Layer (FREE!)                  │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│      │
│  │  │Tesseract │ │Natural.js│ │ OpenFDA  │ │TensorFlow│      │
│  │  │   OCR    │ │   NLP    │ │Drug API  │ │   .js   ││      │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘│      │
│  └────────────────────────────────────────────────────────      │
└────────────────────────┬────────────────────────────────────────┘
                         │ ORM (Sequelize/Mongoose)
┌────────────────────────┴────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │PostgreSQL│  │  Cache   │  │Cloudinary│  │  AI Model│       │
│  │/MongoDB  │  │(In-Memory│  │  (Files) │  │  Storage │       │
│  │   (DB)   │  │  /Redis) │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Frontend Layer (React.js)

#### Component Structure
```javascript
src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx                 // Login form
│   │   ├── Register.jsx              // Registration form
│   │   └── PrivateRoute.jsx          // Protected route wrapper
│   ├── Dashboard/
│   │   ├── AdminDashboard.jsx
│   │   ├── PharmacistDashboard.jsx
│   │   └── CustomerDashboard.jsx
│   ├── Medicines/
│   │   ├── MedicineList.jsx          // Display medicines
│   │   ├── MedicineForm.jsx          // Add/Edit medicine
│   │   ├── MedicineSearch.jsx        // Search component
│   │   └── MedicineCard.jsx          // Individual medicine card
│   ├── Inventory/
│   │   ├── InventoryDashboard.jsx
│   │   ├── StockTable.jsx
│   │   ├── ExpiryAlerts.jsx
│   │   └── ReorderSuggestions.jsx
│   ├── Sales/
│   │   ├── POSSystem.jsx             // Point of Sale
│   │   ├── Cart.jsx
│   │   ├── Invoice.jsx
│   │   └── SalesHistory.jsx
│   ├── Prescriptions/
│   │   ├── PrescriptionList.jsx
│   │   ├── PrescriptionUpload.jsx
│   │   └── PrescriptionDetails.jsx
│   └── AI/
│       ├── PrescriptionScanner.jsx   // OCR interface
│       ├── DrugInteractionChecker.jsx
│       ├── InventoryPredictor.jsx
│       └── AIChatbot.jsx
├── services/
│   ├── api.js                        // Axios instance
│   ├── authService.js                // Auth API calls
│   ├── medicineService.js            // Medicine API calls
│   ├── inventoryService.js
│   ├── salesService.js
│   └── aiService.js                  // AI features API calls
├── store/                            // Redux (optional)
│   ├── store.js
│   └── slices/
│       ├── authSlice.js
│       ├── medicineSlice.js
│       └── cartSlice.js
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
├── App.js
└── index.js
```

#### Key Frontend Features
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: WebSocket for live notifications (optional)
- **Offline Support**: Service workers for PWA (optional)
- **Image Capture**: Camera access for prescription scanning

---

### 2. Backend Layer (Node.js + Express)

#### Application Structure

```javascript
backend/
├── src/
│   ├── config/
│   │   ├── database.js              // DB connection config
│   │   ├── auth.js                  // JWT config
│   │   ├── cloudinary.js            // File storage config
│   │   └── aiConfig.js              // AI services config
│   │
│   ├── controllers/
│   │   ├── authController.js        // Authentication logic
│   │   ├── userController.js        // User management
│   │   ├── medicineController.js    // Medicine CRUD
│   │   ├── inventoryController.js   // Inventory management
│   │   ├── salesController.js       // Sales & billing
│   │   ├── prescriptionController.js// Prescription handling
│   │   └── aiController.js          // AI features
│   │
│   ├── models/                      // Sequelize/Mongoose models
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Medicine.js
│   │   ├── Category.js
│   │   ├── Inventory.js
│   │   ├── Sale.js
│   │   ├── SaleItem.js
│   │   ├── Prescription.js
│   │   ├── PrescriptionItem.js
│   │   ├── DrugInteraction.js
│   │   └── index.js                 // Model associations
│   │
│   ├── routes/
│   │   ├── auth.routes.js           // POST /api/auth/login
│   │   ├── user.routes.js           // CRUD /api/users
│   │   ├── medicine.routes.js       // CRUD /api/medicines
│   │   ├── inventory.routes.js      // CRUD /api/inventory
│   │   ├── sales.routes.js          // CRUD /api/sales
│   │   ├── prescription.routes.js   // CRUD /api/prescriptions
│   │   └── ai.routes.js             // POST /api/ai/*
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js       // JWT verification
│   │   ├── role.middleware.js       // Role-based access
│   │   ├── validation.middleware.js // Request validation
│   │   ├── upload.middleware.js     // Multer file upload
│   │   ├── rateLimit.middleware.js  // Rate limiting
│   │   └── errorHandler.middleware.js
│   │
│   ├── services/
│   │   ├── ocrService.js            // Tesseract.js OCR
│   │   ├── nlpService.js            // Natural.js NLP
│   │   ├── drugCheckService.js      // OpenFDA API
│   │   ├── predictionService.js     // TensorFlow.js
│   │   ├── chatbotService.js        // Wit.ai chatbot
│   │   ├── emailService.js          // Email notifications
│   │   └── reportService.js         // Report generation
│   │
│   ├── utils/
│   │   ├── logger.js                // Winston logger
│   │   ├── validators.js            // Custom validators
│   │   ├── responseHandler.js       // Standardized responses
│   │   ├── dateHelpers.js
│   │   └── fileHelpers.js
│   │
│   └── app.js                       // Express app setup
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── controllers/
│   ├── integration/
│   │   └── api/
│   └── setup.js
│
├── uploads/                         // Temporary uploads
├── .env
├── .env.example
├── .gitignore
├── package.json
└── server.js                        // Entry point
```

---

## Node.js Backend Architecture

### Express.js Application Setup

```javascript
// app.js - Express Application Configuration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth.routes');
const medicineRoutes = require('./routes/medicine.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const salesRoutes = require('./routes/sales.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const aiRoutes = require('./routes/ai.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler.middleware');
const { notFound } = require('./middleware/errorHandler.middleware');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
```

---

## React Frontend Architecture

### API Service Layer

```javascript
// services/api.js - Axios Configuration

import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
```

```javascript
// services/aiService.js - AI Features API Calls

import API from './api';

export const scanPrescription = async (imageFile) => {
  const formData = new FormData();
  formData.append('prescription', imageFile);
  
  const response = await API.post('/ai/scan-prescription', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

export const checkDrugInteractions = async (medicineIds) => {
  const response = await API.post('/ai/check-interactions', {
    medicines: medicineIds
  });
  
  return response.data;
};

export const predictInventory = async (medicineId) => {
  const response = await API.get(`/ai/predict-demand/${medicineId}`);
  return response.data;
};

export const chatbotQuery = async (message) => {
  const response = await API.post('/ai/chatbot', { message });
  return response.data;
};
```

---

## Data Flow

### 1. AI Prescription Processing Flow (Complete)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User uploads prescription image via React component │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend sends FormData to POST /api/ai/scan        │
│         - Uses Axios with multipart/form-data               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Backend - Upload Middleware (Multer)                │
│         - Saves file to ./uploads/prescriptions/             │
│         - Validates file type (jpg, png, pdf)                │
│         - Checks file size (max 5MB)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: aiController.scanPrescription()                     │
│         - Calls ocrService.extractText(filepath)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: ocrService (Tesseract.js) - FREE!                   │
│         - Image preprocessing (sharpen, denoise)             │
│         - Tesseract.recognize(image, 'eng')                  │
│         - Extract text with confidence scores                │
│         - Returns: { text, confidence, words[] }             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: nlpService (Natural.js) - FREE!                     │
│         - Parse extracted text                               │
│         - Extract medicine names (NER)                       │
│         - Extract dosage (regex patterns)                    │
│         - Extract frequency & duration                       │
│         - Extract doctor info                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: drugCheckService (OpenFDA API) - FREE!              │
│         - For each extracted medicine name:                  │
│         - Query OpenFDA: api.fda.gov/drug/label.json         │
│         - Validate medicine exists                           │
│         - Check for drug interactions                        │
│         - Get alternative suggestions                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Save to Database (Sequelize/Mongoose)               │
│         - Create Prescription record                         │
│         - Create PrescriptionItem records                    │
│         - Store original image URL (Cloudinary)              │
│         - Store OCR raw text & confidence                    │
│         - Store parsed structured data                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Response to Frontend                                │
│         {                                                    │
│           success: true,                                     │
│           prescription: {                                    │
│             id: 123,                                         │
│             imageUrl: "...",                                 │
│             ocrConfidence: 92.5,                             │
│             doctorName: "Dr. Smith",                         │
│             medicines: [                                     │
│               {                                              │
│                 name: "Amoxicillin",                         │
│                 dosage: "500mg",                             │
│                 frequency: "2x daily",                       │
│                 duration: "7 days"                           │
│               }                                              │
│             ],                                               │
│             interactions: [],                                │
│             warnings: []                                     │
│           }                                                  │
│         }                                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 10: Frontend displays results                          │
│          - Show extracted data in form                       │
│          - Highlight warnings (red)                          │
│          - Allow pharmacist to review/edit                   │
│          - Button to approve & process order                 │
└─────────────────────────────────────────────────────────────┘
```

### 2. Sales Transaction Flow (Complete)

```
Pharmacist searches medicine (type-ahead search)
    ↓
GET /api/medicines/search?q=paracetamol
    ↓
Backend queries database with LIKE/regex
    ↓
Returns matching medicines with stock info
    ↓
Frontend displays search results
    ↓
Pharmacist selects medicine & quantity
    ↓
Frontend adds to cart (local state)
    ↓
Check inventory availability
    ↓
GET /api/inventory/check?medicineId=123&quantity=10
    ↓
Backend validates stock, expiry, batch info
    ↓
If available: add to cart
If not: suggest alternatives (AI)
    ↓
Apply discounts/coupons (if any)
    ↓
Calculate totals (subtotal, tax, discount)
    ↓
Process payment (cash/card/UPI)
    ↓
POST /api/sales/create
    ↓
Backend transaction begins
    ↓
Create Sale record
Create SaleItem records
Update Inventory (reduce quantities)
Check if reorder needed (threshold)
Generate invoice number
    ↓
If reorder needed: Call prediction service
    ↓
Commit transaction
    ↓
Return invoice data
    ↓
Frontend displays invoice
    ↓
Optional: Print receipt / Send email
```

### 3. Inventory Prediction Flow (AI)

```
Daily cron job runs at midnight
    ↓
predictionService.analyzeInventory()
    ↓
For each medicine:
  - Fetch last 6 months sales data
  - Fetch current stock level
  - Fetch seasonality data
    ↓
Load TensorFlow.js LSTM model
    ↓
Prepare input data:
  - Daily sales quantities
  - Day of week encoding
  - Month encoding
  - Trend indicators
    ↓
model.predict(inputTensor)
    ↓
Get predicted demand for next 30 days
    ↓
Calculate:
  - Reorder point = (predicted_demand * lead_time) + safety_stock
  - Reorder quantity = predicted_demand - current_stock
    ↓
If current_stock < reorder_point:
  - Priority = 'high' if < 7 days stock
  - Priority = 'medium' if < 14 days stock
  - Priority = 'low' if < 30 days stock
    ↓
Save predictions to database
    ↓
Generate notifications for admin/pharmacist
    ↓
Optional: Auto-generate purchase orders
```

---

## AI/ML Architecture (Free Services)

### 1. OCR Service Architecture (Tesseract.js)

```javascript
// services/ocrService.js - Complete Implementation

const Tesseract = require('tesseract.js');
const sharp = require('sharp'); // For image preprocessing

class OCRService {
  constructor() {
    this.tesseractWorker = null;
    this.initWorker();
  }

  async initWorker() {
    // Initialize Tesseract worker (reusable)
    this.tesseractWorker = await Tesseract.createWorker({
      logger: (m) => console.log(m),
    });
    
    await this.tesseractWorker.loadLanguage('eng');
    await this.tesseractWorker.initialize('eng');
  }

  async preprocessImage(imagePath) {
    // Enhance image for better OCR
    const processedPath = imagePath.replace('.', '_processed.');
    
    await sharp(imagePath)
      .grayscale() // Convert to grayscale
      .normalize() // Normalize contrast
      .sharpen() // Sharpen edges
      .toFile(processedPath);
    
    return processedPath;
  }

  async extractText(imagePath) {
    try {
      // Preprocess image
      const processedPath = await this.preprocessImage(imagePath);
      
      // Recognize text
      const { data } = await this.tesseractWorker.recognize(processedPath);
      
      return {
        success: true,
        text: data.text,
        confidence: data.confidence,
        words: data.words.map(w => ({
          text: w.text,
          confidence: w.confidence,
          bbox: w.bbox
        })),
        lines: data.lines.map(l => ({
          text: l.text,
          confidence: l.confidence
        }))
      };
    } catch (error) {
      console.error('OCR Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
    }
  }
}

module.exports = new OCRService();
```

### 2. NLP Service Architecture (Natural.js)

```javascript
// services/nlpService.js - Complete Implementation

const natural = require('natural');
const compromise = require('compromise');

class NLPService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    
    // Medicine name patterns
    this.medicinePatterns = [
      /Tab\.?\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*(?:mg|ml|g|mcg))/gi,
      /Cap\.?\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*(?:mg|ml|g|mcg))/gi,
      /Syp\.?\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*(?:mg|ml|g|mcg))/gi,
    ];
    
    // Frequency patterns
    this.frequencyMap = {
      'once daily': { times: 1, period: 'day' },
      'twice daily': { times: 2, period: 'day' },
      'thrice daily': { times: 3, period: 'day' },
      'bd': { times: 2, period: 'day' },
      'tid': { times: 3, period: 'day' },
      'qid': { times: 4, period: 'day' },
      'every 8 hours': { times: 3, period: 'day' },
      'every 12 hours': { times: 2, period: 'day' },
    };
  }

  parsePrescription(text) {
    const result = {
      doctorName: this.extractDoctorName(text),
      patientName: this.extractPatientName(text),
      date: this.extractDate(text),
      medicines: this.extractMedicines(text)
    };
    
    return result;
  }

  extractDoctorName(text) {
    const patterns = [
      /Dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Physician:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractPatientName(text) {
    const patterns = [
      /Patient:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractDate(text) {
    const datePattern = /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/;
    const match = text.match(datePattern);
    return match ? match[0] : null;
  }

  extractMedicines(text) {
    const medicines = [];
    const lines = text.split('\n');
    
    lines.forEach((line, index) => {
      // Try each pattern
      for (const pattern of this.medicinePatterns) {
        const matches = line.matchAll(pattern);
        
        for (const match of matches) {
          const medicine = {
            name: match[1].trim(),
            dosage: match[2].trim(),
            frequency: this.extractFrequencyFromContext(lines, index),
            duration: this.extractDurationFromContext(lines, index),
            instructions: line.trim()
          };
          
          medicines.push(medicine);
        }
      }
    });
    
    return medicines;
  }

  extractFrequencyFromContext(lines, currentIndex) {
    // Check current line and next 2 lines for frequency
    const contextLines = lines.slice(currentIndex, currentIndex + 3).join(' ').toLowerCase();
    
    for (const [pattern, value] of Object.entries(this.frequencyMap)) {
      if (contextLines.includes(pattern)) {
        return `${value.times} times per ${value.period}`;
      }
    }
    
    return 'as directed';
  }

  extractDurationFromContext(lines, currentIndex) {
    const contextLines = lines.slice(currentIndex, currentIndex + 3).join(' ');
    
    const durationPattern = /(\d+)\s*(day|week|month)s?/i;
    const match = contextLines.match(durationPattern);
    
    return match ? `${match[1]} ${match[2]}s` : null;
  }
}

module.exports = new NLPService();
```

### 3. Drug Interaction Service (OpenFDA API)

```javascript
// services/drugCheckService.js - Complete Implementation

const axios = require('axios');
const NodeCache = require('node-cache');

class DrugInteractionService {
  constructor() {
    this.baseURL = 'https://api.fda.gov/drug';
    this.cache = new NodeCache({ stdTTL: 86400 }); // 24 hour cache
  }

  async checkInteractions(medicineNames) {
    try {
      const interactions = [];
      
      // Check each pair of medicines
      for (let i = 0; i < medicineNames.length; i++) {
        for (let j = i + 1; j < medicineNames.length; j++) {
          const interaction = await this.checkPairInteraction(
            medicineNames[i],
            medicineNames[j]
          );
          
          if (interaction) {
            interactions.push(interaction);
          }
        }
      }
      
      return {
        success: true,
        hasInteractions: interactions.length > 0,
        hasCritical: interactions.some(i => i.severity === 'critical'),
        interactions
      };
    } catch (error) {
      console.error('Drug check error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkPairInteraction(drug1, drug2) {
    // Check cache first
    const cacheKey = `${drug1}_${drug2}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Get drug info from OpenFDA
      const response = await axios.get(`${this.baseURL}/label.json`, {
        params: {
          search: `openfda.generic_name:"${drug1}"`,
          limit: 1
        }
      });
      
      if (!response.data.results || response.data.results.length === 0) {
        return null;
      }
      
      const drugInfo = response.data.results[0];
      const interactionsText = (
        drugInfo.drug_interactions || 
        drugInfo.warnings || 
        []
      ).join(' ').toLowerCase();
      
      // Check if drug2 is mentioned
      if (interactionsText.includes(drug2.toLowerCase())) {
        const interaction = {
          drug1,
          drug2,
          severity: this.determineSeverity(interactionsText),
          description: this.extractInteractionText(interactionsText, drug2),
          source: 'OpenFDA',
          recommendation: this.getRecommendation(interactionsText)
        };
        
        // Cache result
        this.cache.set(cacheKey, interaction);
        
        return interaction;
      }
      
      return null;
    } catch (error) {
      console.error(`Error checking ${drug1} vs ${drug2}:`, error.message);
      return null;
    }
  }

  determineSeverity(text) {
    const textLower = text.toLowerCase();
    
    if (
      textLower.includes('contraindicated') ||
      textLower.includes('fatal') ||
      textLower.includes('life-threatening') ||
      textLower.includes('serious')
    ) {
      return 'critical';
    } else if (textLower.includes('major')) {
      return 'major';
    } else if (textLower.includes('moderate')) {
      return 'moderate';
    }
    
    return 'minor';
  }

  extractInteractionText(fullText, drugName) {
    // Extract sentences containing the drug name
    const sentences = fullText.split(/[.!?]/);
    const relevantSentences = sentences.filter(s => 
      s.toLowerCase().includes(drugName.toLowerCase())
    );
    
    return relevantSentences.join('. ') + '.';
  }

  getRecommendation(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('contraindicated')) {
      return 'Do not combine these medications. Consult prescribing physician immediately.';
    } else if (textLower.includes('monitor')) {
      return 'Close monitoring required when using these medications together.';
    } else if (textLower.includes('dose adjustment')) {
      return 'Dose adjustment may be necessary. Consult physician.';
    }
    
    return 'Consult physician or pharmacist before combining these medications.';
  }

  async getDrugInfo(medicineName) {
    try {
      const response = await axios.get(`${this.baseURL}/label.json`, {
        params: {
          search: `openfda.generic_name:"${medicineName}"`,
          limit: 1
        }
      });
      
      if (!response.data.results || response.data.results.length === 0) {
        return null;
      }
      
      const drug = response.data.results[0];
      
      return {
        name: medicineName,
        brandName: drug.openfda?.brand_name?.[0],
        manufacturer: drug.openfda?.manufacturer_name?.[0],
        dosageForm: drug.openfda?.dosage_form?.[0],
        route: drug.openfda?.route?.[0],
        indications: drug.indications_and_usage?.[0],
        warnings: drug.warnings?.[0],
        adverseReactions: drug.adverse_reactions?.[0]
      };
    } catch (error) {
      console.error(`Error fetching drug info for ${medicineName}:`, error.message);
      return null;
    }
  }
}

module.exports = new DrugInteractionService();
```

### 4. Inventory Prediction Service (TensorFlow.js)

```javascript
// services/predictionService.js - Basic Implementation

const tf = require('@tensorflow/tfjs-node');
const { Sale, SaleItem, Medicine, Inventory } = require('../models');
const { Op } = require('sequelize');

class InventoryPredictionService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
  }

  async loadModel() {
    // For campus project, start with simple time series prediction
    // Can be enhanced with LSTM later
    this.isModelLoaded = true;
  }

  async predictDemand(medicineId, days = 30) {
    try {
      // Get historical sales data (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const sales = await SaleItem.findAll({
        where: {
          medicine_id: medicineId,
          createdAt: {
            [Op.gte]: sixMonthsAgo
          }
        },
        include: [{
          model: Sale,
          attributes: ['created_at']
        }],
        order: [[Sale, 'created_at', 'ASC']]
      });
      
      if (sales.length < 10) {
        // Not enough data for prediction
        return {
          success: false,
          error: 'Insufficient historical data'
        };
      }
      
      // Simple moving average prediction (can be enhanced)
      const dailySales = this.aggregateDailySales(sales);
      const movingAverage = this.calculateMovingAverage(dailySales, 7);
      const predictedDemand = Math.ceil(movingAverage * days);
      
      // Get current stock
      const currentStock = await this.getCurrentStock(medicineId);
      
      // Calculate reorder recommendation
      const daysOfStock = Math.floor(currentStock / movingAverage);
      const shouldReorder = daysOfStock < 14; // Reorder if less than 2 weeks stock
      const reorderQuantity = shouldReorder ? 
        Math.ceil(movingAverage * 30 - currentStock) : 0;
      
      return {
        success: true,
        medicineId,
        predictedDemand,
        currentStock,
        daysOfStock,
        shouldReorder,
        reorderQuantity,
        priority: this.getReorderPriority(daysOfStock),
        confidence: this.calculateConfidence(sales.length)
      };
    } catch (error) {
      console.error('Prediction error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  aggregateDailySales(sales) {
    const dailyMap = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.Sale.created_at).toDateString();
      dailyMap[date] = (dailyMap[date] || 0) + sale.quantity;
    });
    
    return Object.values(dailyMap);
  }

  calculateMovingAverage(data, window = 7) {
    if (data.length < window) {
      return data.reduce((sum, val) => sum + val, 0) / data.length;
    }
    
    const recentData = data.slice(-window);
    return recentData.reduce((sum, val) => sum + val, 0) / window;
  }

  async getCurrentStock(medicineId) {
    const inventory = await Inventory.sum('quantity', {
      where: {
        medicine_id: medicineId,
        expiry_date: {
          [Op.gt]: new Date()
        }
      }
    });
    
    return inventory || 0;
  }

  getReorderPriority(daysOfStock) {
    if (daysOfStock < 7) return 'critical';
    if (daysOfStock < 14) return 'high';
    if (daysOfStock < 30) return 'medium';
    return 'low';
  }

  calculateConfidence(dataPoints) {
    // Confidence based on amount of historical data
    if (dataPoints >= 100) return 0.95;
    if (dataPoints >= 50) return 0.85;
    if (dataPoints >= 30) return 0.75;
    if (dataPoints >= 10) return 0.65;
    return 0.50;
  }

  async analyzeAllInventory() {
    try {
      const medicines = await Medicine.findAll({
        where: { is_active: true }
      });
      
      const predictions = [];
      
      for (const medicine of medicines) {
        const prediction = await this.predictDemand(medicine.id);
        if (prediction.success && prediction