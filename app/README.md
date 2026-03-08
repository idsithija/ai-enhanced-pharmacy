# Pharmacy Management System

AI-Enhanced Pharmacy Management System - Full Stack Application

## 🏗️ Monorepo Structure

This project uses npm workspaces to manage both frontend and backend in a single repository.

```
pharmacy-main/app/
├── package.json          # Root package.json (monorepo config)
├── frontend/            # React + TypeScript + Vite
│   ├── package.json
│   └── src/
└── backend/            # Node.js + Express + TypeScript
    ├── package.json
    └── src/
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL

### Installation

Install all dependencies for both frontend and backend:

```bash
npm install
```

### Development

Run both frontend and backend concurrently:

```bash
npm run dev
```

Run individually:

```bash
# Frontend only (http://localhost:5173)
npm run dev:frontend

# Backend only (http://localhost:5001)
npm run dev:backend
```

### Database Setup

```bash
# Run migrations and seed data
npm run db:setup

# Or individual commands
npm run db:migrate    # Run migrations
npm run db:seed       # Seed with data
npm run db:demo       # Seed demo data
npm run db:reset      # Reset and reseed
```

### Build

Build both applications:

```bash
npm run build
```

Build individually:

```bash
npm run build:frontend
npm run build:backend
```

### Production

```bash
# Start backend server
npm start

# Preview frontend build
npm run start:frontend
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Run both frontend and backend in development mode |
| `npm run dev:frontend` | Run frontend only |
| `npm run dev:backend` | Run backend only |
| `npm run build` | Build both applications |
| `npm run build:frontend` | Build frontend only |
| `npm run build:backend` | Build backend only |
| `npm start` | Start backend in production |
| `npm run lint` | Lint both applications |
| `npm run test` | Run backend tests |
| `npm run clean` | Clean all node_modules and build artifacts |
| `npm run db:setup` | Setup database (migrate + seed) |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database |
| `npm run db:demo` | Seed with demo data |
| `npm run db:reset` | Reset and reseed database |

## 🔧 Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand (State Management)
- React Router
- Axios
- Recharts
- Lucide Icons

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Tesseract.js (OCR)
- Winston (Logging)

## 📝 Environment Variables

Create `.env` files in both frontend and backend directories:

### Backend (.env)
```env
NODE_ENV=development
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmacy_db
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
```

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [API Reference](./backend/API_REFERENCE.md)

## 👨‍💻 Development

This monorepo uses npm workspaces, which means:
- Dependencies are hoisted to the root `node_modules` when possible
- Each workspace has its own `package.json`
- Shared dependencies are installed once
- Run scripts from root using `--workspace` flag

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

MIT © @idsithija
