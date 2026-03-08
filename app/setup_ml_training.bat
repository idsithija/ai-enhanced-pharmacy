@echo off
REM Quick Setup Script for Custom OCR Model Training
REM This script installs dependencies and generates training data

echo ========================================
echo   Custom OCR Model Training Setup
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.8 or higher.
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python is installed
echo.

echo Step 2: Installing dependencies...
echo This may take 5-10 minutes...
cd ml-models\prescription-ocr\training
pip install -r requirements.txt

if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo Step 3: Generating synthetic training data...
python generate_data.py

if errorlevel 1 (
    echo [ERROR] Failed to generate data
    pause
    exit /b 1
)
echo [OK] Training data generated
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Train the model:     python train.py
echo   2. Test accuracy:       python test_accuracy.py
echo   3. Model will be saved to: ml-models/prescription-ocr/model/
echo   4. Backend will automatically use the trained model
echo.
echo Training Options:
echo   - Local CPU:  8-12 hours (not recommended)
echo   - Local GPU:  30-60 minutes
echo   - Google Colab (FREE GPU): 30-60 minutes (recommended)
echo.
echo For Google Colab setup, see: ml-models/prescription-ocr/training/GUIDE.md
echo.
pause
