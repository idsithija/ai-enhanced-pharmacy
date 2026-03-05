# 🚀 Quick Start Guide - Pharmacy Management System

## Prerequisites

✅ Node.js 18+ and npm  
✅ PostgreSQL 14+  
✅ Git  
✅ VS Code (recommended)

---

## 🏃 Quick Setup (5 minutes)

### **Step 1: Database Setup**

Open PostgreSQL terminal (psql):

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pharmacy_db;

# Exit psql
\q
```

### **Step 2: Backend Setup**

```bash
# Navigate to backend
cd backend

# Run automated setup script (Windows)
setup.bat

# OR manually:
npm install
npm run seed
npm run dev
```

**Backend will start on:** http://localhost:5000

### **Step 3: Frontend Setup**

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will start on:** http://localhost:5173

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@pharmacy.com | admin123 |
| **Pharmacist** | pharmacist@pharmacy.com | pharmacist123 |
| **Cashier** | cashier@pharmacy.com | cashier123 |

---

## ✅ Verify Setup

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pharmacy.com","password":"admin123"}'
```

### 2. Test Frontend

1. Open http://localhost:5173
2. Login with **admin@pharmacy.com / admin123**
3. You should see the dashboard with sales data

---

## 📦 What's Included?

### **Backend (Port 5000)**
- ✅ 13 API route groups (Auth, Medicines, Inventory, Sales, etc.)
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ PostgreSQL database with Sequelize ORM
- ✅ Pre-seeded test data:
  - 3 users (admin, pharmacist, cashier)
  - 5 medicines (Paracetamol, Amoxicillin, Ibuprofen, etc.)
  - 2 customers with loyalty points
  - 2 suppliers
  - Sample inventory

### **Frontend (Port 5173)**
- ✅ 8 fully functional pages:
  - Dashboard (sales analytics)
  - Medicines (product catalog)
  - Inventory (stock management)
  - POS (point of sale)
  - Prescriptions (Rx management)
  - Customers (loyalty program)
  - Reports (business intelligence)
  - Settings (system configuration)

---

## 🛠️ Common Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production server
npm run seed         # Reseed database
npm run typecheck    # Check TypeScript types
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 📁 Project Structure

```
pharmacy-main/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # Business logic (13 controllers)
│   │   ├── models/          # Database models (10 models)
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & error handling
│   │   ├── services/        # Business services
│   │   ├── utils/           # Helper functions + seed.ts
│   │   └── config/          # Database config
│   ├── .env                 # Environment variables
│   ├── setup.bat            # Windows setup script
│   └── package.json
│
├── frontend/                # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/           # 8 main pages
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API integration
│   │   ├── store/           # Zustand state management
│   │   └── types/           # TypeScript definitions
│   └── package.json
│
├── docs/                    # Documentation
└── diagrams/               # System diagrams (Mermaid)
```

---

## 🔧 Troubleshooting

### Backend won't start

**Error:** `Cannot connect to database`
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify database exists
psql -U postgres -c "\l"

# Check .env file has correct credentials
# DB_NAME=pharmacy_db
# DB_USER=postgres
# DB_PASSWORD=123456789
```

**Error:** `Port 5000 already in use`
```bash
# Change port in .env
PORT=5001
```

### Frontend won't start

**Error:** `ECONNREFUSED 127.0.0.1:5000`
- Make sure backend is running first
- Check `VITE_API_URL` in frontend/.env

**Error:** `Cannot find module`
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database issues

**Reset database:**
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE pharmacy_db;"
psql -U postgres -c "CREATE DATABASE pharmacy_db;"

# Re-seed
cd backend
npm run seed
```

---

## 📚 Documentation

- **[BACKEND_SETUP.md](backend/BACKEND_SETUP.md)** - Complete backend guide
- **[API_REFERENCE.md](backend/API_REFERENCE.md)** - Full API documentation
- **[docs/](docs/)** - Architecture & design docs
- **[diagrams/](diagrams/)** - System diagrams

---

## 🎯 Next Steps

### Immediate
1. ✅ Get system running (you just did this!)
2. 🔍 Explore all 8 frontend pages
3. 📝 Test API endpoints with Postman/Thunder Client
4. 👥 Create test data (sales, prescriptions, etc.)

### Short-term
1. 🔗 Connect frontend to backend API (currently using mock data)
2. 🎨 Customize branding and theme
3. 📊 Configure reports and analytics
4. 🔔 Set up notifications

### Long-term (AI Features - Currently Deferred)
1. 🤖 OCR for prescription scanning
2. 💬 AI chatbot for drug interactions
3. 📈 Demand prediction with ML
4. 🔍 NLP-based search

---

## 🆘 Need Help?

- **GitHub Issues:** https://github.com/idsithija/pharmacy/issues
- **Documentation:** See `docs/` folder
- **API Docs:** http://localhost:5000/api (when server running)

---

## ✨ Features Overview

### Core Features (✅ Implemented)
- ✅ Multi-user authentication (Admin/Pharmacist/Cashier)
- ✅ Medicine catalog with categories
- ✅ Inventory management with expiry tracking
- ✅ Point of Sale with invoice generation
- ✅ Prescription management & verification
- ✅ Customer loyalty program
- ✅ Comprehensive reporting & analytics
- ✅ Low stock alerts
- ✅ Supplier & purchase order management

### AI Features (🔮 Coming Soon)
- 🔮 Prescription OCR scanning
- 🔮 Drug interaction checking
- 🔮 Demand forecasting
- 🔮 AI-powered inventory optimization

---

## 📝 License

MIT License - See LICENSE file for details

---

**🎉 You're all set! Happy coding! 🚀**
