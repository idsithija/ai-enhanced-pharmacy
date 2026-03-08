# AI-Enhanced Pharmacy Management System - Backend

TypeScript + Node.js + Express.js + PostgreSQL backend with AI-powered features.

## 🚀 Tech Stack

- **Language**: TypeScript 5.3+ with ES6 Modules
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+ with Sequelize ORM
- **AI Services**: Tesseract.js (OCR), Natural.js (NLP), OpenFDA (Drug Info)
- **Authentication**: JWT with bcrypt
- **File Storage**: Cloudinary (Free tier)

## 📁 Project Structure

```
backend/
├── src/                    # TypeScript source files
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── models/            # Database models (Sequelize)
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic & AI services
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript type definitions
│   ├── app.ts             # Express app setup
│   └── server.ts          # Entry point
├── dist/                  # Compiled JavaScript (generated)
├── uploads/               # Temporary file uploads
├── tests/                 # Test files
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies
└── .env.example           # Environment variables template
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js v18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

### PostgreSQL Installation (Windows)

#### Method 1: Official Installer (Recommended)
1. **Download PostgreSQL**: Visit https://www.postgresql.org/download/windows/
2. **Download the installer** by EDB (PostgreSQL 16.x or 15.x)
3. **Run the installer** and follow these settings:
   - Installation Directory: Default (`C:\Program Files\PostgreSQL\16`)
   - Components: Select all (PostgreSQL Server, pgAdmin 4, Command Line Tools)
   - Password: Set a strong password for `postgres` user (**Remember this!**)
   - Port: Keep default `5432`
   - Locale: Default
4. **Complete installation**

#### Method 2: Using pgAdmin 4 (GUI - Easier!)
After installation, pgAdmin 4 is included:
1. Open **pgAdmin 4** from Start Menu
2. Set Master Password (first time only)
3. Expand **"Servers" → PostgreSQL 16**
4. Enter your postgres password
5. Right-click **"Databases"** → Create → Database
6. Name: `pharmacy_db`
7. Click **Save**

#### Method 3: Using Command Line
```powershell
# Verify PostgreSQL is installed
psql --version

# If not found, add to PATH (replace version number):
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Connect to PostgreSQL
psql -U postgres

# Create database (in psql console)
CREATE DATABASE pharmacy_db;
\l  # List databases to verify
\q  # Quit

# OR create database in one command:
psql -U postgres -c "CREATE DATABASE pharmacy_db"
```

#### Troubleshooting PostgreSQL

**"psql is not recognized":**
```powershell
# Add to PATH permanently (run as Administrator):
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\PostgreSQL\16\bin", "Machine")
```

**PostgreSQL service not running:**
```powershell
# Check service status
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-16  # Adjust version number if different
```

**Password authentication failed:**
- Find `pg_hba.conf` in `C:\Program Files\PostgreSQL\16\data\`
- Change method from `md5` to `trust` temporarily
- Restart PostgreSQL service
- Connect and reset password: `ALTER USER postgres PASSWORD 'newpassword';`
- Change back to `md5` and restart

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# On Windows PowerShell:
Copy-Item .env.example .env

# 3. Edit .env with your database credentials
# Update these values:
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_NAME=pharmacy_db
#   DB_USER=postgres
#   DB_PASSWORD=your_postgres_password
#   JWT_SECRET=your-secret-key-change-this

# 4. Database is already created (see PostgreSQL Installation above)
# If not created yet, run:
psql -U postgres -c "CREATE DATABASE pharmacy_db"

# 5. Run TypeScript in development mode (hot reload enabled)
npm run dev

# You should see:
# ✅ Database connection established successfully.
# ✅ Database models synchronized.
# 🚀 Server is running on port 5000
```

## 📜 Available Scripts

```bash
# Development (with hot reload)
npm run dev

# Type checking (no build)
npm run typecheck

# Build TypeScript to JavaScript
npm run build

# Start production server (after build)
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Database migrations
npm run migrate
npm run migrate:undo

# Seed database
npm run seed
```

## 🌐 API Endpoints

**75 RESTful API Endpoints** organized across 13 modules. See [../API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for detailed documentation.

Server runs at: `http://localhost:5000`

### Health Check
- `GET /health` - Server health status

### 🔐 Authentication (4 endpoints)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### 👥 User Management (6 endpoints)
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Create user (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/stats` - Get user statistics (admin)

### 👤 Customer Management (8 endpoints)
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (admin)
- `GET /api/customers/stats` - Get customer statistics
- `GET /api/customers/phone/:phoneNumber` - Find customer by phone
- `PUT /api/customers/:id/loyalty` - Update loyalty points

### 💊 Medicines (5 endpoints)
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Create medicine (admin)
- `GET /api/medicines/:id` - Get medicine by ID
- `PUT /api/medicines/:id` - Update medicine (admin)
- `DELETE /api/medicines/:id` - Delete medicine (admin)

### 📦 Inventory (7 endpoints)
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Add inventory item
- `GET /api/inventory/:id` - Get inventory by ID
- `PUT /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Delete inventory (admin)
- `GET /api/inventory/low-stock` - Get low stock items
- `POST /api/inventory/check` - Check medicine availability

### 🏢 Supplier Management (6 endpoints)
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier (admin/inventory_manager)
- `GET /api/suppliers/:id` - Get supplier by ID
- `PUT /api/suppliers/:id` - Update supplier (admin/inventory_manager)
- `DELETE /api/suppliers/:id` - Delete supplier (admin)
- `GET /api/suppliers/stats` - Get supplier statistics

### 📋 Purchase Orders (8 endpoints)
- `GET /api/purchase-orders` - Get all purchase orders
- `POST /api/purchase-orders` - Create purchase order (admin/inventory_manager)
- `GET /api/purchase-orders/:id` - Get purchase order by ID
- `PUT /api/purchase-orders/:id` - Update purchase order (admin/inventory_manager)
- `DELETE /api/purchase-orders/:id` - Delete purchase order (admin)
- `PUT /api/purchase-orders/:id/approve` - Approve order (admin/pharmacist)
- `PUT /api/purchase-orders/:id/receive` - Receive order (inventory_manager/admin)
- `PUT /api/purchase-orders/:id/cancel` - Cancel order (admin)

### 📋 Prescriptions (6 endpoints)
- `GET /api/prescriptions` - Get all prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:id` - Get prescription by ID
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription (admin)
- `PUT /api/prescriptions/:id/verify` - Verify prescription (pharmacist)
- `PUT /api/prescriptions/:id/reject` - Reject prescription (pharmacist)

### 💰 Sales (4 endpoints)
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales/summary` - Get sales summary

### 📊 Reports & Analytics (6 endpoints)
- `GET /api/reports/sales` - Generate sales report
- `GET /api/reports/inventory` - Get inventory status report
- `GET /api/reports/profit-loss` - Generate profit & loss report (admin)
- `GET /api/reports/prescriptions` - Get prescription statistics
- `GET /api/reports/top-medicines` - Get best-selling medicines
- `GET /api/reports/customer-history/:customerId` - Get customer purchase history

### 🔔 Notifications (6 endpoints)
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications` - Create notification (admin)
- `POST /api/notifications/generate` - Auto-generate notifications (admin/inventory_manager)

### 📊 Dashboard (3 endpoints)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-sales` - Get recent sales
- `GET /api/dashboard/sales-chart` - Get sales chart data

### 🤖 AI Services (6 endpoints)
- `POST /api/ai/ocr/prescription` - OCR prescription scanning (Tesseract.js)
- `POST /api/ai/analyze-prescription` - NLP prescription text analysis (Natural.js)
- `POST /api/ai/drug-interactions` - Check drug interactions (OpenFDA)
- `GET /api/ai/medication-info/:name` - Get medication information (OpenFDA)
- `POST /api/ai/predict-demand` - Predict inventory demand
- `POST /api/ai/chatbot` - AI chatbot assistance (public)

## 🤖 AI Services (All FREE!)

- **Tesseract.js** - OCR for prescription scanning (100% free)
- **Natural.js** - NLP for text parsing (open-source)
- **OpenFDA API** - Drug interaction checking (free government API)
- **TensorFlow.js** - Inventory prediction (open-source)

## 🎓 OCR Training & Synthetic Data Generation

**NEW!** Generate synthetic prescription images for testing, demo, and OCR validation.

### Quick Start

**Windows:**
```powershell
cd app/backend
setup_ocr_training.bat
```

**Manual:**
```powershell
cd scripts
pip install -r requirements.txt
python generate_prescriptions.py    # Generate 100 synthetic prescriptions
python test_ocr_accuracy.py         # Test OCR accuracy (requires Tesseract)
```

### What You Get

- ✅ **100 realistic prescription images** (high/medium/low quality)
- ✅ **Ground truth labels** for accuracy validation
- ✅ **OCR accuracy metrics** (character/word/medicine recall)
- ✅ **Demo-ready data** for system presentation
- ✅ **No real patient data** needed (privacy-safe)

### Files Created

```
synthetic_prescriptions/
├── prescription_0001_high.png     # Synthetic prescription images
├── prescription_0002_medium.png
├── prescription_0003_low.png
├── metadata.json                   # All prescription data
└── labels/
    ├── prescription_0001.txt       # Ground truth for validation
    └── ...
```

### Expected OCR Accuracy

| Quality | Character Accuracy | Use Case |
|---------|-------------------|----------|
| **High** | 90-95% | Demos, testing |
| **Medium** | 80-88% | Real-world validation |
| **Low** | 60-75% | Error handling testing |

### Documentation

- 📖 **Complete Guide**: [scripts/README_OCR_TRAINING.md](scripts/README_OCR_TRAINING.md)
- ⚡ **Quick Reference**: [scripts/QUICK_REFERENCE.md](scripts/QUICK_REFERENCE.md)

### Do You Need to Train OCR Models?

**For most campus projects: NO** ❌

Pre-trained Tesseract works well (70-85% accuracy). Instead of complex model training:

1. ✅ **Add image preprocessing** (grayscale, contrast, sharpen) → +10-15% accuracy
2. ✅ **Implement medicine autocorrection** (fuzzy matching with DB) → +15-20% accuracy
3. ✅ **Build good verification UI** (pharmacist reviews low-confidence results)
4. ✅ **Use synthetic data** for demos and testing

**See** [scripts/QUICK_REFERENCE.md](scripts/QUICK_REFERENCE.md) for details.

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT authentication
- Password hashing with bcrypt
- Input validation with express-validator
- SQL injection protection (Sequelize ORM)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🐛 Debugging

Enable detailed logs:
```bash
LOG_LEVEL=debug npm run dev
```

## 📦 TypeScript Benefits

- ✅ Type safety and IntelliSense
- ✅ Better code documentation
- ✅ Catch errors at compile time
- ✅ Modern ES6+ features
- ✅ Better IDE support

## 🚢 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `DB_*` - PostgreSQL credentials
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUDINARY_*` - Cloudinary config (optional)

## 📚 Resources

- [TypeScript Docs](https://www.typescriptlang.org/)
- [Express.js Docs](https://expressjs.com)
- [Sequelize Docs](https://sequelize.org)
- [Tesseract.js](https://tesseract.projectnaptha.com)

## 👨‍💻 Developer

- **Author**: @idsithija
- **Version**: 1.0.0
- **Date**: October 20, 2025

## 📄 License

MIT License - Free for educational and commercial use
