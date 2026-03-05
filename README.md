# 🏥 AI-Enhanced Pharmacy Management System

A modern, full-stack pharmacy management system with AI-powered features built using **TypeScript**, **Node.js**, **React**, and **Vite**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Project Overview

This AI-Enhanced Pharmacy Management System is a comprehensive solution for managing pharmacy operations with intelligent automation. The system includes:

- 💊 **Medicine Inventory Management**
- 🛒 **Point of Sale (POS) System**
- 📋 **Prescription Management**
- 👥 **Customer & User Management**
- 📊 **Sales & Analytics**
- 🤖 **AI-Powered Features** (OCR, NLP, Drug Interaction Checker)

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+ with Sequelize ORM
- **Authentication**: JWT with bcrypt
- **File Storage**: Cloudinary
- **AI Services**: 
  - Tesseract.js (OCR) - FREE
  - Natural.js (NLP) - FREE
  - OpenFDA API - FREE
  - TensorFlow.js - FREE

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript 5.3+
- **Build Tool**: Vite 5+
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **State Management**: Zustand
- **Forms**: Formik + Yup
- **HTTP Client**: Axios

---

## 📁 Project Structure

```
pharmacy/
├── app/                    # Application code
│   ├── backend/            # Node.js + TypeScript backend
│   │   ├── src/
│   │   │   ├── config/     # Configuration files
│   │   │   ├── controllers/ # Route controllers
│   │   │   ├── models/     # Database models
│   │   │   ├── routes/     # API routes
│   │   │   ├── middleware/ # Custom middleware
│   │   │   ├── services/   # Business logic & AI services
│   │   │   ├── utils/      # Utility functions
│   │   │   └── types/      # TypeScript types
│   │   ├── uploads/        # File uploads
│   │   ├── dist/           # Compiled JavaScript
│   │   └── package.json
│   │
│   ├── frontend/           # React + TypeScript frontend
│   │   ├── src/
│   │   │   ├── components/ # Reusable components
│   │   │   ├── pages/      # Page components
│   │   │   ├── services/   # API services
│   │   │   ├── hooks/      # Custom React hooks
│   │   │   ├── types/      # TypeScript types
│   │   │   └── assets/     # Images, fonts, etc.
│   │   ├── public/         # Static files
│   │   ├── dist/           # Build output
│   │   └── package.json
│   │
│   └── ui-mockups/         # HTML/CSS UI mockups & prototypes
│
├── docs/                   # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── FINAL_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA_Version2.md
│   ├── FLOWCHARTS_Version2.md
│   ├── FRONTEND_SCREENS_Version2.md
│   ├── PROJECT_OVERVIEW_Version2.md
│   └── SYSTEM_ARCHITECTURE_Version2.md
│
├── diagrams/               # Mermaid diagrams (architecture, ERD, etc.)
│
├── archive/                # Archived working files
│
└── README.md              # This file
```

---

## � Documentation

This project includes comprehensive documentation:

- **[README.md](README.md)** - Project overview, setup guide, and quick start (you are here)
- **[Pharmacy_Management_System_Final_Project.docx](Pharmacy_Management_System_Final_Project.docx)** - Final Word document for submission
- **[docs/](docs/)** - All project documentation
  - [FINAL_DOCUMENTATION.md](docs/FINAL_DOCUMENTATION.md) - Complete final year project documentation
  - [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) - Full REST API reference with examples
  - Database schema, system architecture, frontend screens, flowcharts
- **[diagrams/](diagrams/)** - All Mermaid diagrams (.mmd files) and diagram index
  - See [DIAGRAMS_INDEX.md](diagrams/DIAGRAMS_INDEX.md) for complete list of 12 diagrams
- **[archive/](archive/)** - Archived working copies and process files

---

## �🔧 Installation & Setup

### Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** or **yarn**
- **Git**

### Clone Repository

```bash
git clone https://github.com/idsithija/pharmacy.git
cd pharmacy
```

### Backend Setup

```bash
# Navigate to backend
cd app/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET, etc.

# Create PostgreSQL database
createdb pharmacy_db

# Start development server
npm run dev
```

Backend will run at: `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend (from project root)
cd app/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

---

## 📜 Available Scripts

### Backend Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run typecheck    # Check TypeScript types
npm run lint         # Lint code
npm run format       # Format code with Prettier
npm test             # Run tests
```

### Frontend Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Check TypeScript types
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

---

## 🤖 AI Features (All FREE!)

### 1. AI Prescription Scanner
- **Technology**: Tesseract.js OCR
- **Feature**: Scan prescription images and extract text
- **Cost**: 100% FREE

### 2. AI Prescription Parser
- **Technology**: Natural.js NLP
- **Feature**: Extract medicine names, dosage, frequency from text
- **Cost**: 100% FREE (open-source)

### 3. Drug Interaction Checker
- **Technology**: OpenFDA API
- **Feature**: Real-time drug interaction warnings
- **Cost**: 100% FREE (government API)

### 4. Inventory Demand Prediction
- **Technology**: TensorFlow.js
- **Feature**: Predict medicine demand and reorder points
- **Cost**: 100% FREE (open-source)

---

## 📊 Features

### Core Features
✅ User authentication & authorization (Admin/Pharmacist/Customer)  
✅ Medicine database management with categories  
✅ Inventory tracking with batch numbers & expiry dates  
✅ Point of Sale (POS) system with invoicing  
✅ Sales & billing management  
✅ Customer profile management  
✅ Supplier management  
✅ Prescription management  
✅ Comprehensive reporting & analytics  

### AI Features
🤖 AI prescription scanning (OCR)  
🤖 Intelligent prescription parsing (NLP)  
🤖 Drug interaction detection  
🤖 Inventory demand forecasting  
🤖 Low stock alerts  
🤖 Expiry date monitoring  

---

## 🌐 API Documentation

**75+ RESTful API Endpoints** across 13 modules. See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details.

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Quick Overview

#### Authentication (4 endpoints)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update user profile

#### User Management (6 endpoints)
- `GET /users` - Get all users
- `POST /users` - Create user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/stats` - Get user statistics

#### Customer Management (8 endpoints)
- CRUD operations, customer stats, phone lookup, loyalty points

#### Medicine Management (5 endpoints)
- CRUD operations for medicines with search & filtering

#### Inventory Management (7 endpoints)
- Stock management, low stock alerts, expiry tracking, availability checks

#### Prescription Management (6 endpoints)
- Upload, verify, dispense, reject prescriptions

#### Sales & POS (4 endpoints)
- Create sales, view transactions, sales summaries

#### Supplier Management (6 endpoints)
- CRUD operations, supplier statistics

#### Purchase Orders (8 endpoints)
- CRUD, approve, receive, cancel orders with inventory updates

#### Reports & Analytics (6 endpoints)
- Sales reports, inventory reports, profit/loss, top medicines, customer history

#### Notifications (6 endpoints)
- Get, create, read, delete notifications, auto-generate alerts

#### Dashboard (3 endpoints)
- Real-time statistics, recent sales, sales charts

#### AI Services (6 endpoints)
- `POST /ai/ocr/prescription` - OCR prescription scanning
- `POST /ai/analyze-prescription` - NLP prescription analysis
- `POST /ai/drug-interactions` - Drug interaction check
- `GET /ai/medication-info/:name` - Medication information
- `POST /ai/predict-demand` - Inventory demand prediction
- `POST /ai/chatbot` - AI chatbot assistance

For complete API documentation with request/response examples, authentication requirements, and error codes, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ SQL injection protection (Sequelize ORM)
- ✅ XSS protection
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet.js security headers

---

## 🚢 Deployment

### Backend Deployment Options
- **Render.com** (Free tier available)
- **Railway.app** (Free tier available)
- **Heroku**
- **AWS / DigitalOcean / Azure**

### Frontend Deployment Options
- **Vercel** (Recommended - Free)
- **Netlify** (Free)
- **GitHub Pages**
- **Cloudflare Pages**

### Database Hosting
- **Supabase** (Free 500MB)
- **Railway PostgreSQL** (Free tier)
- **ElephantSQL** (Free 20MB)

---

## 📚 Documentation

Detailed documentation available in `/docs` folder:

- **PROJECT_OVERVIEW_Version2.md** - Complete project overview
- **SYSTEM_ARCHITECTURE_Version2.md** - System architecture details
- **DATABASE_SCHEMA_Version2.md** - Database design & models
- **FLOWCHARTS_Version2.md** - System flowcharts
- **FRONTEND_SCREENS_Version2.md** - UI/UX wireframes

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

- **Name**: Sithija (@idsithija)
- **GitHub**: [https://github.com/idsithija](https://github.com/idsithija)
- **Repository**: [https://github.com/idsithija/pharmacy](https://github.com/idsithija/pharmacy)
- **Version**: 1.0.0
- **Date**: October 20, 2025

---

## 🙏 Acknowledgments

- **Tesseract.js** - Free OCR engine
- **OpenFDA** - Free drug data API
- **TensorFlow.js** - Machine learning library
- **Natural.js** - NLP library
- **Node.js & React** - Amazing open-source communities

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: [your-email@example.com]

---

## 🎯 Project Status

🚧 **In Development** - Initial setup complete, implementation in progress

### Backend - Completed ✅
- [x] Project structure with TypeScript
- [x] 10 Database models with associations
- [x] 13 Controller modules
- [x] 75 API endpoints across 13 route modules
- [x] JWT Authentication & Authorization (4 roles)
- [x] 3 AI Services (OCR, NLP, Drug Info)
- [x] PostgreSQL integration
- [x] Complete API documentation

### Backend Implementation Summary
- **Models**: User, Medicine, Inventory, Prescription, Sale, Customer, Supplier, PurchaseOrder, Notification (10 total)
- **Controllers**: Auth, User, Medicine, Inventory, Prescription, Sale, Customer, Supplier, PurchaseOrder, Report, Notification, Dashboard, AI (13 total)
- **API Endpoints**: 75 RESTful endpoints with full CRUD operations
- **AI Features**: Tesseract.js OCR, Natural.js NLP, OpenFDA integration, Demand prediction, Chatbot

### Frontend - In Progress 🔄
- [x] Frontend initial setup (React + Vite + TypeScript)
- [ ] UI components
- [ ] State management
- [ ] API integration
- [ ] Authentication UI
- [ ] Dashboard implementation

### Planned 📅
- [ ] Frontend implementation
- [ ] Testing suite (Jest + React Testing Library)
- [ ] Deployment (Vercel + Railway)
- [ ] Mobile app (React Native)

---

⭐ **Star this repo if you find it helpful!**

---

**Made with ❤️ by @idsithija**
