# AI-Enhanced Pharmacy Management System
## Campus Project Documentation - Node.js Stack

### Project Information
- **Project Name**: AI-Enhanced Pharmacy Management System
- **Version**: 1.0.0
- **Date**: October 20, 2025
- **Developer**: @idsithija (Sithija)
- **Project Type**: Campus Project
- **Tech Stack**: Node.js + React.js + Free AI Models
- **GitHub**: https://github.com/idsithija/ai-pharmacy-system

---

## Executive Summary

This AI-Enhanced Pharmacy Management System is a modern, cost-effective solution built specifically for campus projects using **Node.js backend** and **free/open-source AI models**. The system manages inventory, sales, prescriptions, and customer data while providing intelligent assistance through AI-powered features - all without expensive commercial AI services.

---

## Project Objectives

1. **Automate Pharmacy Operations**
   - Digitize medicine inventory management
   - Streamline sales and billing processes
   - Manage customer and prescription records

2. **Integrate Free AI Features**
   - Intelligent prescription reading using **Tesseract.js** (free OCR)
   - Automated drug interaction detection using **OpenFDA API** (free)
   - Predictive inventory management using **TensorFlow.js** (free)
   - AI-powered customer assistance using **free chatbot frameworks**

3. **Improve Patient Safety**
   - Real-time drug interaction warnings
   - Expiry date tracking
   - Prescription validation

4. **Enhance Business Intelligence**
   - Sales analytics and reporting
   - Inventory optimization
   - Trend analysis and forecasting

---

## Key Features

### Core Features
- ✅ User Authentication & Authorization (Admin, Pharmacist, Customer)
- ✅ Medicine Database Management
- ✅ Inventory Management with Expiry Tracking
- ✅ Point of Sale (POS) System
- ✅ Sales & Billing Management
- ✅ Customer Profile Management
- ✅ Supplier Management
- ✅ Comprehensive Reporting

### AI-Powered Features (All FREE!)
- 🤖 **AI Prescription Scanner** - Tesseract.js OCR (100% Free)
- 🤖 **AI Prescription Analysis** - Natural.js / Compromise.js NLP (Free)
- 🤖 **AI Drug Interaction Checker** - OpenFDA API (Free Government API)
- 🤖 **AI Inventory Prediction** - TensorFlow.js (Free)
- 🤖 **AI Chatbot Assistant** - Wit.ai / Botpress (Free)
- 🤖 **AI Image Recognition** - Pre-trained models (Free)

---

## Target Users

1. **System Administrator**
   - Full system access and configuration
   - User management
   - System settings and backup

2. **Pharmacist**
   - Process prescriptions
   - Manage sales and inventory
   - Customer consultation

3. **Customer/Patient**
   - View prescription history
   - Check medicine availability
   - Interact with AI chatbot

---

## Technology Stack (FREE/Open-Source)

### Backend Stack
```json
{
  "runtime": "Node.js v18+",
  "framework": "Express.js",
  "language": "JavaScript / TypeScript (optional)",
  "authentication": "Passport.js + JWT",
  "validation": "Express-validator / Joi"
}
```

### Database Stack
```json
{
  "primary": "PostgreSQL 14+ or MongoDB",
  "orm": "Sequelize (PostgreSQL) / Mongoose (MongoDB)",
  "cache": "Node-cache / Redis (optional)",
  "migrations": "Sequelize-CLI / Migrate-mongo"
}
```

### Frontend Stack
```json
{
  "framework": "React.js 18+ / Next.js (optional)",
  "language": "JavaScript / TypeScript",
  "ui": "Material-UI (MUI) / Tailwind CSS",
  "state": "Redux Toolkit / Context API",
  "http": "Axios",
  "forms": "Formik + Yup validation"
}
```

### AI/ML Stack (ALL FREE!)
```json
{
  "ocr": "Tesseract.js (100% free, open-source)",
  "nlp": "Natural.js / Compromise.js (free)",
  "ml": "TensorFlow.js / Brain.js (free)",
  "drugData": "OpenFDA API / RxNorm API (free government APIs)",
  "chatbot": "Wit.ai (Meta - free) / Botpress (open-source)"
}
```

### Free Hosting Options
```json
{
  "backend": "Render.com (free) / Railway (free tier) / Fly.io",
  "frontend": "Vercel (free) / Netlify (free) / GitHub Pages",
  "database": "Supabase (free 500MB) / MongoDB Atlas (free 512MB)",
  "storage": "Cloudinary (free 25GB) / Supabase Storage"
}
```

### DevOps & Tools
- **Version Control**: Git & GitHub
- **API Testing**: Postman / Thunder Client
- **Package Manager**: npm / yarn
- **Linting**: ESLint + Prettier
- **Testing**: Jest + Supertest
- **Documentation**: JSDoc / Swagger

---

## Project Structure

```
ai-pharmacy-system/
│
├── backend/                          # Node.js Express Backend
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.js
│   │   │   ├── auth.js
│   │   │   └── aiConfig.js
│   │   ├── controllers/              # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── medicineController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── salesController.js
│   │   │   ├── prescriptionController.js
│   │   │   └── aiController.js
│   │   ├── models/                   # Database models (Sequelize/Mongoose)
│   │   │   ├── User.js
│   │   │   ├── Medicine.js
│   │   │   ├── Inventory.js
│   │   │   ├── Sale.js
│   │   │   ├── Prescription.js
│   │   │   └── index.js
│   │   ├── routes/                   # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── medicine.routes.js
│   │   │   ├── inventory.routes.js
│   │   │   ├── sales.routes.js
│   │   │   └── ai.routes.js
│   │   ├── middleware/               # Custom middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── services/                 # Business logic & AI services
│   │   │   ├── ocrService.js         # Tesseract.js (FREE)
│   │   │   ├── nlpService.js         # Natural.js (FREE)
│   │   │   ├── drugCheckService.js   # OpenFDA API (FREE)
│   │   │   ├── predictionService.js  # TensorFlow.js (FREE)
│   │   │   └── chatbotService.js     # Wit.ai/Botpress (FREE)
│   │   ├── utils/                    # Helper functions
│   │   │   ├── logger.js
│   │   │   ├── validators.js
│   │   │   ├── dateHelpers.js
│   │   │   └── responseHandler.js
│   │   └── app.js                    # Express app setup
│   ├── tests/                        # Jest tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.js
│   ├── uploads/                      # Temporary file uploads
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                     # Entry point
│
├── frontend/                         # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── Medicines/
│   │   │   │   ├── MedicineList.jsx
│   │   │   │   └── MedicineForm.jsx
│   │   │   ├── Inventory/
│   │   │   │   └── InventoryManager.jsx
│   │   │   ├── Sales/
│   │   │   │   └── POSSystem.jsx
│   │   │   ├── Prescriptions/
│   │   │   │   └── PrescriptionManager.jsx
│   │   │   └── AI/
│   │   │       ├── PrescriptionScanner.jsx
│   │   │       ├── DrugChecker.jsx
│   │   │       └── AIChatbot.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/                 # API service layer
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── medicineService.js
│   │   │   └── aiService.js
│   │   ├── store/                    # Redux store (optional)
│   │   │   ├── store.js
│   │   │   ├── slices/
│   │   │   └── actions/
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── ai-models/                        # AI/ML models and configs
│   ├── ocr/
│   │   ├── tesseract-config.js
│   │   └── preprocessing.js
│   ├── nlp/
│   │   ├── medicine-extractor.js
│   │   └── prescription-parser.js
│   ├── prediction/
│   │   ├── train-model.js
│   │   ├── model.json
│   │   └── predict.js
│   └── chatbot/
│       ├── intents.json
│       └── bot-config.js
│
├── database/                         # Database setup
│   ├── migrations/                   # Sequelize migrations
│   ├── seeders/                      # Seed data
│   └── init.sql                      # Initial SQL setup
│
├── docs/                             # Documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   ├── SETUP_GUIDE.md
│   └── FLOWCHARTS.md
│
├── scripts/                          # Utility scripts
│   ├── setup.sh
│   └── deploy.sh
│
├── .gitignore
├── README.md
├── package.json
└── docker-compose.yml (optional)
```

---

## Project Timeline (8 Weeks)

### 📅 **Week 1: Setup & Planning**
- ✅ Create GitHub repository
- ✅ Setup Node.js backend structure
- ✅ Setup React frontend structure
- ✅ Database design and setup
- ✅ Complete documentation
- ✅ Install dependencies

### 📅 **Week 2: Authentication & User Management**
- 👤 User registration and login
- 🔐 JWT authentication
- 🛡️ Role-based access control
- 👥 User profile management

### 📅 **Week 3: Core Pharmacy Features**
- 💊 Medicine management (CRUD)
- 📦 Inventory management
- 🏷️ Category management
- 📊 Basic dashboard

### 📅 **Week 4: Sales & Billing System**
- 🛒 POS system
- 🧾 Invoice generation
- 💰 Payment processing
- 📈 Sales reporting

### 📅 **Week 5: AI Feature 1 - Prescription Scanner**
- 📸 Image upload functionality
- 🔍 Tesseract.js OCR integration
- 📝 Text extraction and display
- ✅ Prescription validation

### 📅 **Week 6: AI Feature 2 - NLP & Drug Checker**
- 🧠 Natural.js NLP integration
- 💊 Medicine name extraction
- ⚠️ OpenFDA drug interaction API
- 🚨 Warning system

### 📅 **Week 7: AI Feature 3 - Prediction & Chatbot**
- 📊 TensorFlow.js inventory prediction
- 🤖 Chatbot integration (Wit.ai)
- 🔔 Notification system
- 📱 Mobile-responsive UI

### 📅 **Week 8: Testing & Deployment**
- ✅ Unit testing
- 🔗 Integration testing
- 📚 Documentation finalization
- 🚀 Deploy to free hosting
- 🎉 Project presentation prep

---

## Free AI Models & Services Details

### 1. **Tesseract.js OCR** (100% Free)
```javascript
// No API key needed!
npm install tesseract.js
```
- **Cost**: FREE forever
- **Usage**: Unlimited
- **Accuracy**: 85-95% for printed text
- **Languages**: 100+ languages supported

### 2. **Natural.js / Compromise.js** (Open Source)
```javascript
npm install natural compromise
```
- **Cost**: FREE forever (open-source)
- **Usage**: Unlimited
- **Features**: Tokenization, stemming, NER, sentiment analysis

### 3. **OpenFDA API** (Free Government API)
```javascript
// No API key required for basic usage!
https://api.fda.gov/drug/label.json
```
- **Cost**: FREE
- **Rate Limit**: 240 requests/minute, 120,000/day (no API key)
- **Data**: Official FDA drug information

### 4. **TensorFlow.js** (Open Source)
```javascript
npm install @tensorflow/tfjs-node
```
- **Cost**: FREE forever
- **Usage**: Unlimited
- **Models**: Pre-trained models available

### 5. **Wit.ai Chatbot** (Free by Meta)
```javascript
npm install node-wit
```
- **Cost**: FREE
- **Usage**: Unlimited requests
- **Features**: NLP, intent recognition, entity extraction

---

## Environment Variables (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmacy_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# AI Services (All FREE!)
# Tesseract.js - No key needed
# Natural.js - No key needed
# OpenFDA - No key needed (optional for higher limits)

# Wit.ai (Optional - for chatbot)
WIT_AI_TOKEN=your_free_wit_ai_token

# Cloudinary (Free tier - 25GB)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## Installation & Setup

### Prerequisites
```bash
- Node.js v18+ installed
- PostgreSQL 14+ or MongoDB installed
- Git installed
- Code editor (VS Code recommended)
```

### Quick Start
```bash
# Clone repository
git clone https://github.com/idsithija/ai-pharmacy-system.git
cd ai-pharmacy-system

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configurations
npm run migrate
npm run seed
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env
npm start
```

---

## Success Metrics

- ✅ **OCR Accuracy**: 90%+ prescription text extraction
- ✅ **Drug Interaction Detection**: Real-time warnings for all major interactions
- ✅ **Inventory Prediction**: 80%+ accuracy in demand forecasting
- ✅ **System Performance**: < 2 second response time for all API calls
- ✅ **User Experience**: Intuitive UI with < 5 minutes training time
- ✅ **Cost**: $0 monthly cost (using all free tiers)

---

## Campus Project Benefits

### ✅ **Zero Cost**
- All AI services are free
- Free hosting options available
- No subscription fees

### ✅ **Learning Opportunities**
- Modern JavaScript/Node.js development
- React.js frontend development
- AI/ML integration experience
- REST API design
- Database design and management

### ✅ **Portfolio Ready**
- Real-world application
- Modern tech stack
- AI/ML features
- Deployable project

### ✅ **Scalable**
- Can upgrade to paid services later
- Modular architecture
- Easy to extend features

---

## Future Enhancements

### Phase 2 (Post-Campus Project)
- 📱 Mobile app (React Native)
- 🔐 Multi-factor authentication
- 📊 Advanced analytics dashboard
- 🌐 Multi-language support
- 💳 Payment gateway integration

### Phase 3 (Advanced)
- 🏥 Telemedicine integration
- 🔗 Insurance provider API integration
- 🔐 Blockchain for prescription verification
- 🤖 Advanced AI chatbot with voice
- 📡 IoT integration for smart inventory

---

## Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| OCR accuracy limitations | Medium | Use image preprocessing, allow manual correction |
| Free API rate limits | Low | Implement caching, optimize API calls |
| Data privacy concerns | High | Implement encryption, follow best practices |
| Limited free storage | Medium | Use compression, cleanup old files |
| Learning curve | Medium | Good documentation, start simple |

---

## Support & Resources

### Learning Resources
- **Node.js**: https://nodejs.org/docs
- **Express.js**: https://expressjs.com
- **React.js**: https://react.dev
- **Tesseract.js**: https://tesseract.projectnaptha.com
- **TensorFlow.js**: https://www.tensorflow.org/js
- **OpenFDA**: https://open.fda.gov

### Developer
- **Name**: Sithija (@idsithija)
- **GitHub**: https://github.com/idsithija
- **Repository**: [To be created]

---

## License

MIT License - Free for educational and commercial use

---

## Acknowledgments

- Tesseract OCR Team
- OpenFDA for free drug data API
- TensorFlow.js Team
- Natural.js Contributors
- Node.js Community

---

*Last Updated: October 20, 2025*  
*Version: 1.0.0*  
*Author: @idsithija*