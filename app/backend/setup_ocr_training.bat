@echo off
REM Quick Start Script for OCR Synthetic Data Generation
REM This script generates synthetic prescriptions and tests OCR accuracy

echo ================================================================
echo   OCR Synthetic Data Generation - Quick Start
echo ================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Python installation...
python --version
echo.

REM Navigate to scripts directory
cd scripts 2>nul
if errorlevel 1 (
    echo Already in scripts directory
) else (
    echo Navigated to scripts directory
)
echo.

REM Install dependencies
echo [2/4] Installing Python dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo WARNING: Some dependencies may have failed to install
    echo This is usually OK - Pillow is the only critical dependency
)
echo.

REM Generate synthetic prescriptions
echo [3/4] Generating 100 synthetic prescriptions...
echo This will create realistic prescription images for testing/demo
echo.
python generate_prescriptions.py
if errorlevel 1 (
    echo ERROR: Failed to generate prescriptions
    pause
    exit /b 1
)
echo.

REM Test OCR accuracy (optional - requires Tesseract)
echo [4/4] Testing OCR accuracy...
echo.
echo Checking if Tesseract OCR is installed...
tesseract --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ================================================================
    echo   NOTICE: Tesseract OCR not found
    echo ================================================================
    echo.
    echo Tesseract is optional but recommended for testing OCR accuracy.
    echo.
    echo To install Tesseract:
    echo   • Download from: https://github.com/UB-Mannheim/tesseract/wiki
    echo   • Install to: C:\Program Files\Tesseract-OCR
    echo   • Add to PATH in System Environment Variables
    echo.
    echo You can skip this step and still use the generated images
    echo for demos and system testing.
    echo.
    echo SKIP OCR testing for now? (Y/N):
    set /p skipOcr=
    if /i "%skipOcr%"=="Y" goto :skipOcr
    if /i "%skipOcr%"=="y" goto :skipOcr
) else (
    echo Tesseract found! Running OCR accuracy tests...
    echo.
    python test_ocr_accuracy.py
    if errorlevel 1 (
        echo WARNING: OCR testing encountered errors
        echo This is OK - the synthetic images are still usable
    )
)

:skipOcr
echo.
echo ================================================================
echo   SUCCESS! Setup Complete
echo ================================================================
echo.
echo Generated Files:
echo   • 100 prescription images in: synthetic_prescriptions/
echo   • Ground truth labels in: synthetic_prescriptions/labels/
echo   • Metadata file: synthetic_prescriptions/metadata.json
echo.
echo Next Steps:
echo   1. Review generated images in synthetic_prescriptions/
echo   2. Copy images to frontend/public/demo-data/ for demos
echo   3. Use images to test prescription upload feature
echo   4. Implement image preprocessing for better OCR accuracy
echo.
echo For detailed documentation, see: README_OCR_TRAINING.md
echo.
pause
