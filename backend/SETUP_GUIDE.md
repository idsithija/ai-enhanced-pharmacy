# Backend Setup Guide

## ✅ What's Created

### TypeScript Backend with ES6 Modules

```
backend/
├── src/
│   ├── config/              ✅ Empty (ready for configs)
│   ├── controllers/         ✅ Empty (ready for controllers)
│   ├── models/              ✅ Empty (ready for models)
│   ├── routes/              ✅ Empty (ready for routes)
│   ├── middleware/          ✅ Empty (ready for middleware)
│   ├── services/            ✅ Empty (ready for services)
│   ├── utils/               ✅ Empty (ready for utilities)
│   └── types/
│       └── index.ts         ✅ TypeScript type definitions
├── dist/                    ✅ Empty (build output)
├── uploads/
│   └── prescriptions/       ✅ Empty (file uploads)
├── tests/                   ✅ Empty (tests)
├── package.json             ✅ All dependencies configured
├── tsconfig.json            ✅ TypeScript config with ES6
├── .env.example             ✅ Environment template
├── .gitignore               ✅ Git ignore rules
├── .eslintrc.json           ✅ ESLint config for TypeScript
├── .prettierrc.json         ✅ Prettier config
└── README.md                ✅ Documentation
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- **TypeScript** - Type-safe JavaScript
- **tsx** - TypeScript execution with hot reload
- **Express.js** - Web framework
- **Sequelize** - ORM with TypeScript support
- **All AI packages** - Tesseract.js, Natural.js, etc.
- **Type definitions** - @types/* packages

### 2. Create .env File

```bash
# Copy template
cp .env.example .env

# Edit with your settings (use notepad, VS Code, or any editor)
notepad .env
```

Required settings:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL credentials
- `JWT_SECRET` - Random secure string for JWT
- `PORT` - Server port (default: 5000)

### 3. Setup Database

**Option A: Local PostgreSQL**
```bash
# Create database using psql
createdb pharmacy_db

# Or using psql command line
psql -U postgres
CREATE DATABASE pharmacy_db;
\q
```

**Option B: Docker (Easier)**
```bash
docker run --name pharmacy-postgres ^
  -e POSTGRES_PASSWORD=password ^
  -e POSTGRES_DB=pharmacy_db ^
  -p 5432:5432 -d postgres:14
```

### 4. Start Development Server

```bash
npm run dev
```

You should see TypeScript compilation and server start!

## 📦 TypeScript Configuration

### tsconfig.json Features
- ✅ **Target**: ES2022 (modern JavaScript)
- ✅ **Module**: ESNext (ES6 modules)
- ✅ **Strict mode**: Enabled (type safety)
- ✅ **Source maps**: Enabled (debugging)
- ✅ **Output**: dist/ folder

### package.json Features
- ✅ **"type": "module"** - ES6 imports/exports
- ✅ **tsx** - Fast TypeScript execution
- ✅ **Hot reload** - Auto-restart on changes

## 🛠️ Development Workflow

### During Development (Hot Reload)
```bash
npm run dev
```

### Type Checking (No Build)
```bash
npm run typecheck
```

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm start
```

### Code Quality
```bash
# Lint TypeScript code
npm run lint

# Format code with Prettier
npm run format
```

## 📝 What to Create Next

### Phase 1: Basic Structure
1. Create `src/server.ts` - Entry point
2. Create `src/app.ts` - Express setup
3. Create `src/config/database.ts` - DB config

### Phase 2: Core Features
4. Create middleware files
5. Create model files (TypeScript + Sequelize)
6. Create route files
7. Create controller files

### Phase 3: AI Features
8. Create AI service files
9. Integrate OCR, NLP, etc.

## 🎯 TypeScript + ES6 Benefits

### Type Safety
```typescript
// Before (JavaScript)
function addUser(name, email) {
  // No type checking
}

// After (TypeScript)
function addUser(name: string, email: string): User {
  // Compile-time type checking!
}
```

### ES6 Modules
```typescript
// Import (ES6)
import express from 'express';
import { User } from './models/User';

// Export (ES6)
export const authController = { ... };
export default router;
```

### Auto-completion
- Full IntelliSense in VS Code
- Better code suggestions
- Catch errors before running

### Modern Features
- Async/await (native)
- Optional chaining (?.)
- Nullish coalescing (??)
- Template literals
- Destructuring
- Spread operators

## 🐛 Troubleshooting

### "Cannot find module" error
- Run `npm install`
- Check imports use `.js` extension (TypeScript requirement)

### "Module not found" after build
- Ensure `tsconfig.json` has correct `outDir`
- Check `package.json` has `"type": "module"`

### Database connection failed
- Check PostgreSQL is running: `psql -U postgres`
- Verify credentials in `.env`
- Ensure database exists: `createdb pharmacy_db`

### Port already in use
- Change PORT in `.env`
- Or kill process: `netstat -ano | findstr :5000`

## 📚 Learning Resources

- **TypeScript**: https://www.typescriptlang.org/docs/
- **ES6 Modules**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **Sequelize + TypeScript**: https://sequelize.org/docs/v6/other-topics/typescript/
- **Express + TypeScript**: https://expressjs.com/

## ✨ Next Steps

**Ready to continue?** You can now:

1. **Add basic files** - server.ts, app.ts, config files
2. **Create models** - TypeScript interfaces + Sequelize models
3. **Create routes** - RESTful API endpoints
4. **Add AI services** - OCR, NLP, drug checker

Just let me know what you want to create next! 🚀
