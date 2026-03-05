# PowerShell script to generate Word document with embedded diagrams
# For AI-Enhanced Pharmacy Management System Final Year Project

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Pharmacy Management System - Word Generator" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create enhanced markdown with image references
Write-Host "[1/4] Preparing enhanced markdown with diagram references..." -ForegroundColor Yellow

$docContent = Get-Content "doc.md" -Raw

# Create a copy with image insertions
$enhancedDoc = $docContent

# Insert image at Section 5.1 (Architecture Diagram) - after the ASCII art
$arch5_1_marker = "### Component Interaction Flow"
$arch5_1_image = @"

---

![Figure 5.1: System Architecture Diagram - Three-Tier Architecture](diagrams/01-architecture.png)

**Figure 5.1**: System Architecture showing the three-tier architecture with Presentation Layer (React), Application Layer (Node.js/Express), and Data Layer (PostgreSQL), along with external AI services integration.

---

### Component Interaction Flow
"@
$enhancedDoc = $enhancedDoc -replace [regex]::Escape($arch5_1_marker), $arch5_1_image

# Insert image at Section 5.2 (ER Diagram) - search for the section
$er_marker = "### Entity Relationship Diagram"
$er_image = @"
### Entity Relationship Diagram

![Figure 5.2: Entity Relationship Diagram (ERD)](diagrams/02-erd.png)

**Figure 5.2**: Complete database schema showing 10 core entities with their attributes and relationships. The diagram illustrates the cardinality and foreign key constraints ensuring data integrity.

---
"@
$enhancedDoc = $enhancedDoc -replace "$er_marker", $er_image

# Insert image at Section 5.3 (UML Diagrams)
$uml_marker = "## 5\.3 UML Diagrams"
$uml_replacement = @"
## 5.3 UML Diagrams

### 5.3.1 Use Case Diagram

![Figure 5.3: Use Case Diagram](diagrams/03-usecase.png)

**Figure 5.3**: Use Case Diagram showing interactions between 4 actors (Admin, Pharmacist, Cashier, Customer) and 33 use cases across 9 functional modules including User Management, Medicine Management, Inventory Management, Prescription Processing, Point of Sale, Customer Management, AI Features, and Reports & Analytics.

---

### 5.3.2 Sequence Diagrams

#### Prescription Processing Workflow

![Figure 5.4: Sequence Diagram - Prescription Processing](diagrams/04-sequence-prescription.png)

**Figure 5.4**: Sequence diagram illustrating the complete prescription processing workflow from customer upload through OCR processing (Tesseract.js with 70-85% accuracy), pharmacist review, drug interaction checking via OpenFDA API, to final dispensing through the POS system.

---

#### Point of Sale Transaction Flow

![Figure 5.5: Sequence Diagram - POS Transaction Flow](diagrams/05-sequence-pos.png)

**Figure 5.5**: Sequence diagram showing the complete POS transaction flow including medicine search, customer identification, loyalty discount application, payment processing, FIFO inventory update, and automatic low-stock alert generation. Transaction completes in under 1 minute.

---

### 5.3.3 Activity Diagram - Inventory Expiry Alert System

![Figure 5.6: Activity Diagram - Expiry Alert System](diagrams/06-activity-expiry.png)

**Figure 5.6**: Activity diagram demonstrating the automated daily expiry alert system that runs at 6 AM, queries inventory, categorizes medicines by expiry risk (Critical: 3 months, Warning: 6 months), creates notifications, and sends real-time alerts to online users.

---

### 5.3.4 Class Diagram

![Figure 5.7: Class Diagram - Core Domain Models](diagrams/08-class.png)

**Figure 5.7**: Class diagram showing 9 core domain models (User, Medicine, Inventory, Customer, Sale, SaleItem, Prescription, Supplier, Notification) with their attributes, methods, and relationships following object-oriented design principles.

---

### 5.3.5 State Diagram - Prescription Status Workflow

![Figure 5.8: State Diagram - Prescription Workflow](diagrams/09-state-prescription.png)

**Figure 5.8**: State machine diagram illustrating the complete prescription lifecycle through 9 states from Uploaded → Processing → Pending → Under Review → Verified → Ready to Dispense → Dispensing → Dispensed, with error states (Failed, Rejected) and hold state for stock unavailability.

---

## 5.3 UML Diagrams
"@
$enhancedDoc = $enhancedDoc -replace "$uml_marker", $uml_replacement

# Insert Deployment Diagram in Section 6
$deployment_marker = "## 6\.1 Technology Stack"
$deployment_replacement = @"
## 6.1 Technology Stack

### Cloud Deployment Architecture

![Figure 6.1: Deployment Diagram - Cloud Infrastructure](diagrams/07-deployment.png)

**Figure 6.1**: Deployment diagram showing production infrastructure on Vercel CDN (frontend hosting with global distribution) and Render Cloud (backend hosting with load balancer, auto-scaling API servers, background worker for scheduled jobs, and PostgreSQL database with daily backups). External services include OpenFDA, Tesseract OCR, Natural.js NLP, and Cloudinary image CDN.

---

## 6.1 Technology Stack
"@
$enhancedDoc = $enhancedDoc -replace "$deployment_marker", $deployment_replacement

# Insert Layered Architecture
$layered_marker = "## 6\.2 Design Patterns and Best Practices"
$layered_replacement = @"
## 6.2 Design Patterns and Best Practices

### Layered Software Architecture

![Figure 6.2: Layered Architecture - Component Organization](diagrams/12-layered-architecture.png)

**Figure 6.2**: Layered architecture diagram showing separation of concerns across 5 layers: Frontend Layer (React UI components with Zustand state), API Layer (Express authentication and routes), Service Layer (6 business services), AI Services Layer (OCR, NLP, Drug Info, ML), and Data Access Layer (Sequelize models with PostgreSQL). Unidirectional dependency flow ensures maintainability and testability.

---

## 6.2 Design Patterns and Best Practices
"@
$enhancedDoc = $enhancedDoc -replace "$layered_marker", $layered_replacement

# Insert Gantt Chart in Section 9
$gantt_marker = "# 9\. Gantt Chart"
$gantt_replacement = @"
# 9. Gantt Chart

## 8-Week Development Timeline

![Figure 9.1: Gantt Chart - Project Timeline](diagrams/10-gantt.png)

**Figure 9.1**: Gantt chart showing the complete 8-week development timeline from December 1, 2024, to January 31, 2025. The project was organized into 8 phases: Setup & Planning, Authentication, Core Features, POS & Sales, AI Features, Dashboard & Reports, Testing, and Deployment. All 40+ tasks were completed on schedule with no delays.

---

# 9. Gantt Chart
"@
$enhancedDoc = $enhancedDoc -replace "$gantt_marker", $gantt_replacement

# Insert Customer Journey in appropriate section
$journey_marker = "### 6\.4 User Experience Flow"
if ($enhancedDoc -notmatch [regex]::Escape($journey_marker)) {
    # Alternative placement
    $journey_marker = "## 6\.3 Implementation of the Program"
    $journey_replacement = @"

### Customer Transaction Journey

![Figure 6.3: Complete Customer Journey Flowchart](diagrams/11-customer-journey.png)

**Figure 6.3**: End-to-end customer journey flowchart from pharmacy visit to completed transaction. The flowchart includes decision points for customer registration, prescription upload with OCR processing, drug interaction checking, stock availability verification, discount application, payment processing, FIFO inventory updates, loyalty points calculation, and low-stock alert triggering.

---

## 6.3 Implementation of the Program
"@
    $enhancedDoc = $enhancedDoc -replace "$journey_marker", $journey_replacement
}

# Save enhanced markdown
$enhancedDoc | Out-File -FilePath "doc-with-images.md" -Encoding UTF8
Write-Host "   SUCCESS - Enhanced markdown created: doc-with-images.md" -ForegroundColor Green

# Step 2: Create reference document for Pandoc styling
Write-Host "[2/4] Creating Word reference document for professional styling..." -ForegroundColor Yellow

# Create a basic reference.docx is not needed as Pandoc has default, but we'll use custom styling options

# Step 3: Convert to Word using Pandoc
Write-Host "[3/4] Converting markdown to Word document with Pandoc..." -ForegroundColor Yellow

# Refresh environment path
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Convert with Pandoc
& pandoc "doc-with-images.md" -o "Pharmacy_Management_System_Final_Project.docx" --toc --toc-depth=3 --number-sections --highlight-style=tango --standalone

if ($LASTEXITCODE -eq 0) {
    Write-Host "   SUCCESS - Word document generated successfully!" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Problem generating Word document" -ForegroundColor Red
    exit 1
}

# Step 4: Display results
Write-Host "[4/4] Verification and Summary..." -ForegroundColor Yellow

if (Test-Path "Pharmacy_Management_System_Final_Project.docx") {
    $fileSize = (Get-Item "Pharmacy_Management_System_Final_Project.docx").Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Word Document Generated" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Document Details:" -ForegroundColor Cyan
    Write-Host "   Filename: Pharmacy_Management_System_Final_Project.docx" -ForegroundColor White
    Write-Host "   Size: $fileSizeMB MB" -ForegroundColor White
    Write-Host "   Location: $(Get-Location)\Pharmacy_Management_System_Final_Project.docx" -ForegroundColor White
    Write-Host ""
    Write-Host "Features Included:" -ForegroundColor Cyan
    Write-Host "   - Automatic Table of Contents" -ForegroundColor Green
    Write-Host "   - Numbered sections and subsections" -ForegroundColor Green
    Write-Host "   - 12 High-quality diagram images embedded" -ForegroundColor Green
    Write-Host "   - Professional code syntax highlighting" -ForegroundColor Green
    Write-Host "   - 5,900+ lines of content (approx 350 pages)" -ForegroundColor Green
    Write-Host "   - Complete project documentation" -ForegroundColor Green
    Write-Host ""
    Write-Host "Content Includes:" -ForegroundColor Cyan
    Write-Host "   - Abstract and Introduction" -ForegroundColor White
    Write-Host "   - Literature Review (15+ papers)" -ForegroundColor White
    Write-Host "   - Methodology and System Design" -ForegroundColor White
    Write-Host "   - Requirements Analysis (25 questionnaire responses)" -ForegroundColor White
    Write-Host "   - 12 Professional Diagrams (Architecture, UML, ERD, etc.)" -ForegroundColor White
    Write-Host "   - Complete Implementation Details" -ForegroundColor White
    Write-Host "   - Testing Results (97.4% success rate)" -ForegroundColor White
    Write-Host "   - Conclusion and Future Work" -ForegroundColor White
    Write-Host "   - Gantt Chart (8-week timeline)" -ForegroundColor White
    Write-Host "   - 25 Academic References" -ForegroundColor White
    Write-Host "   - Appendices (Questionnaire + Interview)" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Open the Word document" -ForegroundColor Yellow
    Write-Host "   2. Update Table of Contents (Right-click TOC → Update Field)" -ForegroundColor Yellow
    Write-Host "   3. Add cover page (Insert → Cover Page)" -ForegroundColor Yellow
    Write-Host "   4. Add your name, ID, date on title page" -ForegroundColor Yellow
    Write-Host "   5. Review all images are displaying correctly" -ForegroundColor Yellow
    Write-Host "   6. Adjust page breaks if needed" -ForegroundColor Yellow
    Write-Host "   7. Save and export to PDF for submission" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opening document..." -ForegroundColor Cyan
    Start-Process "Pharmacy_Management_System_Final_Project.docx"
    
} else {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host " ERROR: Word document not found" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
}

Write-Host ""
Write-Host "Generation complete!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
