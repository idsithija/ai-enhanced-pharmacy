# AI-Enhanced Pharmacy Management System

A full-stack pharmacy management system built with React, Node.js, and PostgreSQL, enhanced with AI features including prescription OCR scanning, drug interaction checking, demand prediction, and an intelligent chatbot.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Guide](#setup-guide)
  - [1. Clone & Install Dependencies](#1-clone--install-dependencies)
  - [2. Set Up PostgreSQL](#2-set-up-postgresql)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Initialize the Database](#4-initialize-the-database)
  - [5. Start the Application](#5-start-the-application)
  - [6. (Optional) Set Up the OCR Service](#6-optional-set-up-the-ocr-service)
- [Default Login Credentials](#default-login-credentials)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **User Management** — Role-based access control (Admin, Pharmacist, Cashier)
- **Medicine Catalog** — Full CRUD for medicines with search and filtering
- **Inventory Management** — Stock tracking, low-stock alerts, batch management
- **Point of Sale (POS)** — Process sales with receipt generation
- **Prescription Management** — Upload, scan, verify, and track prescriptions
- **Customer Management** — Customer profiles with loyalty points
- **Supplier & Purchase Orders** — Manage suppliers and restock orders
- **Reports & Analytics** — Sales reports, inventory reports, profit/loss, charts
- **AI-Powered OCR** — Scan prescription images and extract medication data (PaddleOCR)
- **Drug Interaction Checker** — Check for dangerous drug combinations (OpenFDA)
- **Demand Prediction** — Forecast inventory needs based on sales history
- **AI Chatbot** — Pharmacy assistant chatbot for medication queries
- **Dashboard** — Real-time overview of sales, inventory, and notifications

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Recharts |
| **Backend** | Node.js, Express, TypeScript, Sequelize ORM, JWT, Winston |
| **Database** | PostgreSQL 14+ |
| **AI / ML** | PaddleOCR (prescription scanning), Natural.js (NLP), OpenFDA API |
| **OCR Service** | Python, FastAPI, PaddleOCR |

---

## Project Structure

```
ai-enhanced-pharmacy/
├── package.json              # Monorepo root (npm workspaces)
├── backend/                  # Express API server
│   ├── src/
│   │   ├── app.ts            # Express app setup
│   │   ├── server.ts         # Entry point
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Route handlers (13 modules)
│   │   ├── models/           # Sequelize models (10 models)
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/       # Auth, error handling
│   │   ├── services/         # AI & business logic services
│   │   ├── scripts/          # Database seed scripts
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Helper utilities
│   └── uploads/              # Uploaded prescription files
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── pages/            # Page components (16 pages)
│   │   ├── components/       # Shared components
│   │   ├── services/         # API client services
│   │   ├── store/            # Zustand state management
│   │   ├── layouts/          # Page layouts
│   │   └── hooks/            # Custom React hooks
│   └── public/               # Static assets
└── ml-models/                # Machine learning models
    └── prescription-ocr/     # PaddleOCR prescription scanner
        ├── api_service.py    # FastAPI OCR service
        ├── requirements.txt  # Python dependencies
        └── training/         # Training notebooks
```

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | >= 18.0.0 | [nodejs.org](https://nodejs.org/) |
| **npm** | >= 9.0.0 | Comes with Node.js |
| **PostgreSQL** | >= 14 | [postgresql.org/download](https://www.postgresql.org/download/) |
| **Python** | >= 3.9 (optional, for OCR) | [python.org](https://www.python.org/downloads/) |

---

## Setup Guide

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/idsithija/ai-enhanced-pharmacy.git
cd ai-enhanced-pharmacy

# Install all dependencies (frontend + backend)
npm install
```

This installs dependencies for both the frontend and backend workspaces automatically.

### 2. Set Up PostgreSQL

#### Option A: Using pgAdmin (GUI — Recommended for beginners)

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Set a master password on first launch
3. Expand **Servers > PostgreSQL**
4. Enter your postgres user password
5. Right-click **Databases > Create > Database**
6. Set the name to `pharmacy_db` and click **Save**

#### Option B: Using the Command Line

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE pharmacy_db;

# Verify it was created
\l

# Exit
\q
```

#### Option C: Windows Quick Setup (one command)

```powershell
psql -U postgres -c "CREATE DATABASE pharmacy_db"
```

> **Tip:** If `psql` is not recognized, add PostgreSQL to your PATH:
> ```powershell
> # Replace 16 with your PostgreSQL version number
> $env:Path += ";C:\Program Files\PostgreSQL\16\bin"
> ```

### 3. Configure Environment Variables

#### Backend

```bash
# From the project root
cp backend/.env.example backend/.env
```

Open `backend/.env` and update these values:

```env
# Server
NODE_ENV=development
PORT=5000

# Database — update with your PostgreSQL credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmacy_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT — change these to random secret strings
JWT_SECRET=change-this-to-a-random-secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=change-this-to-another-random-secret
JWT_REFRESH_EXPIRE=30d

# OCR service (optional — only if running the Python OCR service)
OCR_API_URL=http://127.0.0.1:8000

# Frontend URL for CORS
CLIENT_URL=http://localhost:5173
```

#### Frontend

```bash
cp frontend/.env.example frontend/.env
```

Open `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Initialize the Database

```bash
# Run migrations and seed with sample data
npm run db:setup

# Or seed with more comprehensive demo data
npm run db:demo
```

This creates all database tables and populates them with sample medicines, customers, and user accounts.

### 5. Start the Application

```bash
# Start both frontend and backend in development mode
npm run dev
```

Once running, open your browser:

| Service | URL |
|---------|-----|
| **Frontend** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:5000/api](http://localhost:5000/api) |
| **Health Check** | [http://localhost:5000/health](http://localhost:5000/health) |

### 6. (Optional) Set Up the OCR Service

The OCR service uses PaddleOCR to scan prescription images. It runs as a separate Python service.

```bash
# Create a Python virtual environment
cd ml-models/prescription-ocr
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the OCR service
python api_service.py
```

The OCR service runs on [http://127.0.0.1:8000](http://127.0.0.1:8000). The backend connects to it automatically when `OCR_API_URL` is set in your `.env`.

---

## Default Login Credentials

After seeding the database, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@pharmacy.com` | `admin123` |
| **Staff** | `staff@pharmacy.com` | `staff123` |
| **User** | `user@pharmacy.com` | `user123` |

> **Note:** Change these passwords after your first login in a production environment.

---

## Available Scripts

Run these from the project root:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend + backend in development mode |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run build` | Build both applications for production |
| `npm start` | Start the backend in production mode |
| `npm run test` | Run backend tests |
| `npm run lint` | Lint both frontend and backend |
| `npm run clean` | Remove all `node_modules` and build artifacts |
| `npm run db:setup` | Run migrations + seed the database |
| `npm run db:demo` | Run migrations + seed with demo data |
| `npm run db:reset` | Reset and re-seed the database |

---

## API Reference

The backend exposes **75 RESTful API endpoints** across 13 modules:

| Module | Base Path | Endpoints |
|--------|-----------|-----------|
| Auth | `/api/auth` | Register, Login, Profile |
| Users | `/api/users` | CRUD + statistics |
| Medicines | `/api/medicines` | CRUD |
| Inventory | `/api/inventory` | CRUD + low-stock alerts |
| Customers | `/api/customers` | CRUD + loyalty points |
| Prescriptions | `/api/prescriptions` | CRUD + verify/reject |
| Sales | `/api/sales` | CRUD + summaries |
| Suppliers | `/api/suppliers` | CRUD + statistics |
| Purchase Orders | `/api/purchase-orders` | CRUD + approve/receive/cancel |
| Reports | `/api/reports` | Sales, inventory, P&L, top medicines |
| Dashboard | `/api/dashboard` | Stats, recent sales, chart data |
| Notifications | `/api/notifications` | CRUD + mark read |
| AI Services | `/api/ai` | OCR, drug interactions, chatbot, predictions |

For detailed endpoint documentation, see [backend/API_REFERENCE.md](./backend/API_REFERENCE.md).

---

## Troubleshooting

### PostgreSQL connection refused

Make sure the PostgreSQL service is running:

```powershell
# Windows
Get-Service postgresql*
Start-Service postgresql-x64-16   # adjust version number
```

### "psql is not recognized" on Windows

Add the PostgreSQL bin directory to your system PATH:

```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\PostgreSQL\16\bin", "Machine")
```

### Port already in use

If port 5000 or 5173 is already in use:

```powershell
# Find what's using the port
netstat -ano | findstr :5000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

Or change the port in `backend/.env` (`PORT=5001`) and update `frontend/.env` accordingly.

### Database tables not created

The backend auto-syncs models in development mode. If tables are missing:

```bash
npm run db:reset
```

### OCR service not responding

Make sure the Python OCR service is running separately on port 8000, and `OCR_API_URL=http://127.0.0.1:8000` is set in `backend/.env`. The application works without the OCR service — prescription scanning will just be unavailable.

---

## License

MIT © [@idsithija](https://github.com/idsithija)
