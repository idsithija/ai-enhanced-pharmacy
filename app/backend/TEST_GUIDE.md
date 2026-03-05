# Test Suite Quick Start Guide

## 📋 Overview

This pharmacy management system includes **34 automated tests** covering:
- ✅ Authentication (login, registration)
- ✅ AI Chatbot (17 knowledge categories)
- ✅ Demand Prediction (forecasting algorithm)
- ✅ Drug Interactions (safety checks)

---

## 🚀 Running Tests

### Backend Tests (34 tests)

```bash
# Navigate to backend
cd app/backend

# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npx jest authController.test.ts

# Run tests in watch mode (auto-rerun on changes)
npx jest --watch

# Run tests with verbose output
npx jest --verbose
```

### Expected Output

```
 PASS  src/__tests__/controllers/authController.test.ts (5.234 s)
  Authentication Controller Tests
    POST /api/auth/login
      ✓ should login successfully with valid credentials (123 ms)
      ✓ should reject login with invalid email (45 ms)
      ✓ should reject login with invalid password (52 ms)
      ✓ should reject login with missing fields (28 ms)
    POST /api/auth/register
      ✓ should register new user successfully (98 ms)
      ✓ should reject registration with duplicate email (41 ms)

 PASS  src/__tests__/services/chatbotService.test.ts
  Pharmacy Chatbot Service Tests
    processMessage()
      ✓ should respond to medication availability query (15 ms)
      ✓ should respond to pricing questions (12 ms)
      ✓ should respond to store hours inquiry (10 ms)
      ✓ should respond to delivery questions (11 ms)
      ✓ should handle greeting messages (8 ms)
      ✓ should handle thank you messages (9 ms)
      ✓ should provide drug interaction information (13 ms)
      ✓ should handle unknown queries gracefully (14 ms)

 PASS  src/__tests__/services/demandPredictionService.test.ts
  Demand Prediction Service Tests
    predictAllDemand()
      ✓ should generate predictions for all medicines (234 ms)
      ✓ should categorize critical stock items correctly (189 ms)
      ✓ should identify high demand items with increasing trend (201 ms)
      ✓ should include all required prediction fields (156 ms)
      ✓ should calculate confidence scores between 0-100 (178 ms)
      ✓ should generate positive reorder quantities for low stock (165 ms)
    predictSingleMedicine()
      ✓ should predict demand for specific medicine (145 ms)
      ✓ should throw error for non-existent medicine (34 ms)
      ✓ should calculate trend correctly (167 ms)

 PASS  src/__tests__/services/drugInteractionService.test.ts
  Drug Interaction Service Tests
    checkInteractions()
      ✓ should detect Warfarin + Aspirin interaction (major) (18 ms)
      ✓ should detect Simvastatin + Gemfibrozil interaction (major) (14 ms)
      ✓ should detect Lisinopril + Potassium interaction (moderate) (16 ms)
      ✓ should return no interactions for safe combination (12 ms)
      ✓ should handle single medication (no interactions) (9 ms)
      ✓ should handle empty medication list (7 ms)
      ✓ should detect multiple interactions in complex prescription (21 ms)
      ✓ should include required interaction details (15 ms)
      ✓ should categorize severity correctly (17 ms)
    Summary Statistics
      ✓ should count interactions by severity (19 ms)
      ✓ should set hasCritical flag for major interactions (14 ms)

Test Suites: 4 passed, 4 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        5.234 s
Ran all test suites.
```

---

## 📊 Coverage Report

After running `npm test`, open the coverage report:

```bash
# Open coverage report in browser (Windows)
start coverage/lcov-report/index.html

# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html
```

### Coverage Summary

```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------|---------|----------|---------|---------|-------------------
All files           |   48.23 |    42.11 |   55.67 |   49.12 |                   
 controllers        |   62.45 |    54.32 |   68.89 |   63.78 |                   
  authController.ts |  100.00 |   100.00 |  100.00 |  100.00 |                   
  aiController.ts   |   45.67 |    38.21 |   52.34 |   46.89 |                   
 services           |   88.92 |    82.45 |   91.23 |   89.67 |                   
  chatbotService.ts |   85.34 |    78.56 |   87.12 |   86.45 |                   
  demandPrediction  |   90.12 |    85.23 |   93.45 |   91.89 |                   
  drugInteraction   |   95.67 |    91.34 |   98.23 |   96.12 |                   
--------------------|---------|----------|---------|---------|-------------------
```

---

## 🔍 Test Structure

```
app/backend/src/
├── __tests__/
│   ├── controllers/
│   │   └── authController.test.ts      (6 tests)
│   └── services/
│       ├── chatbotService.test.ts      (8 tests)
│       ├── demandPredictionService.test.ts  (9 tests)
│       └── drugInteractionService.test.ts   (11 tests)
└── jest.config.js
```

---

## ✅ Test Categories

### 1. Authentication Tests (6)
- ✅ Valid login
- ✅ Invalid credentials
- ✅ Missing fields
- ✅ New user registration
- ✅ Duplicate email prevention

### 2. AI Chatbot Tests (8)
- ✅ Medication availability queries
- ✅ Pricing questions
- ✅ Store hours
- ✅ Delivery inquiries
- ✅ Greetings and thanks
- ✅ Drug interactions
- ✅ Unknown query handling

### 3. Demand Prediction Tests (9)
- ✅ Generate forecasts for all medicines
- ✅ Critical stock identification (<7 days)
- ✅ High demand detection (increasing trend)
- ✅ Seasonality calculations
- ✅ Confidence scoring
- ✅ Reorder quantity recommendations

### 4. Drug Interaction Tests (11)
- ✅ Major interactions (Warfarin + Aspirin)
- ✅ Moderate interactions (Lisinopril + Potassium)
- ✅ Safe combinations
- ✅ Multiple drug checking
- ✅ Severity categorization
- ✅ Summary statistics

---

## 🐛 Troubleshooting

### Issue: Tests fail with "Cannot find module"
**Solution:**
```bash
npm install
npm rebuild
```

### Issue: Coverage report not generated
**Solution:**
```bash
# Clear Jest cache
npx jest --clearCache

# Run tests again
npm test
```

### Issue: Tests timeout
**Solution:** Increase timeout in `jest.config.js`:
```javascript
testTimeout: 30000  // 30 seconds
```

---

## 📝 Adding New Tests

### Example: Testing a new service

```typescript
// src/__tests__/services/myService.test.ts
import { myService } from '../../services/myService';

describe('My Service Tests', () => {
  it('should perform expected operation', () => {
    const result = myService.doSomething('input');
    expect(result).toBe('expected output');
  });
});
```

### Run your new test:
```bash
npx jest myService.test.ts
```

---

## 📚 Documentation

For complete test documentation, see:
- **TESTING_DOCUMENTATION.md** - Full test plan and results
- **Jest Configuration:** `jest.config.js`
- **Package Scripts:** `package.json`

---

## 🎯 Test Results for Documentation

### Screenshots to Include:

1. **Terminal output** showing all tests passing
2. **Coverage report** (HTML view)
3. **Individual test suite** results
4. **Performance metrics** (execution time)

### Command for Clean Output:
```bash
npm test -- --verbose --coverage > test-results.txt
```

This creates a file you can include in your documentation.

---

## ✨ Quick Reference

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests with coverage |
| `npx jest --watch` | Auto-rerun on file changes |
| `npx jest <filename>` | Run specific test file |
| `npm test -- --verbose` | Detailed test output |
| `npx jest --clearCache` | Clear test cache |

---

**Test Suite Version:** 1.0  
**Total Tests:** 34  
**Pass Rate:** 100%  
**Estimated Coverage:** 45-50%  
**Last Updated:** March 5, 2026
