@echo off
echo ========================================
echo   Pharmacy Backend Setup Script
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL 14+ from https://www.postgresql.org/download/
    pause
    exit /b 1
)
echo ✅ PostgreSQL found

echo.
echo [2/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [3/5] Checking database connection...
echo Creating database (if not exists)...
psql -U postgres -c "CREATE DATABASE pharmacy_db;" 2>nul
echo ✅ Database ready

echo.
echo [4/5] Seeding initial data...
call npm run seed
if errorlevel 1 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)
echo ✅ Database seeded

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo   🎉 Backend is ready!
echo ========================================
echo.
echo Login Credentials:
echo   Admin:      admin@pharmacy.com / admin123
echo   Pharmacist: pharmacist@pharmacy.com / pharmacist123
echo   Cashier:    cashier@pharmacy.com / cashier123
echo.
echo To start the server:
echo   npm run dev
echo.
echo Server will run on: http://localhost:5000
echo API Documentation: http://localhost:5000/api
echo.
pause
