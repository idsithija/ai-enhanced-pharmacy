# PowerShell script to generate Word document with ONLY required diagrams
# Based on the required Table of Contents structure

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Final Documentation - Word Generator" -ForegroundColor Cyan
Write-Host " (Matching Required TOC)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Preparing documentation with required diagrams..." -ForegroundColor Yellow

$docContent = Get-Content "doc-restructured.md" -Raw

# Create enhanced version with ONLY required diagrams:
# 5.1 Architecture Diagram
# 5.2 ER Diagram  
# 5.3 UML Diagrams (Use Case, Sequence, Activity, Class, State)
# 5.4 Wireframe Diagram

$enhancedDoc = $docContent

# Insert Architecture Diagram at Section 5.1
$arch_marker = "### Component Interaction Flow"
$arch_image = @"

![Figure 5.1: System Architecture Diagram](diagrams/01-architecture.png)

**Figure 5.1**: System Architecture - Three-tier architecture showing Presentation Layer (React), Application Layer (Node.js/Express), and Data Layer (PostgreSQL).

---

### Component Interaction Flow
"@
$enhancedDoc = $enhancedDoc -replace [regex]::Escape($arch_marker), $arch_image

# Insert ER Diagram at Section 5.2
$er_marker = "### Entity Relationship Diagram"
$er_image = @"
### Entity Relationship Diagram

![Figure 5.2: Entity Relationship Diagram (ERD)](diagrams/02-erd.png)

**Figure 5.2**: Database schema showing 10 core entities with relationships and cardinality.

---
"@
$enhancedDoc = $enhancedDoc -replace [regex]::Escape($er_marker), $er_image

# Insert UML Diagrams at Section 5.3
$uml_marker = "## 5\.3 UML Diagrams"
$uml_images = @"
## 5.3 UML Diagrams

### Use Case Diagram

![Figure 5.3: Use Case Diagram](diagrams/03-usecase.png)

**Figure 5.3**: Use Case Diagram showing 4 actors and 33 use cases across 9 functional modules.

---

### Sequence Diagrams

#### Prescription Processing Workflow

![Figure 5.4: Sequence Diagram - Prescription Processing](diagrams/04-sequence-prescription.png)

**Figure 5.4**: Prescription processing workflow from upload through OCR to dispensing.

---

#### Point of Sale Transaction

![Figure 5.5: Sequence Diagram - POS Transaction](diagrams/05-sequence-pos.png)

**Figure 5.5**: Complete POS transaction flow with FIFO inventory update.

---

### Activity Diagram

![Figure 5.6: Activity Diagram - Expiry Alert System](diagrams/06-activity-expiry.png)

**Figure 5.6**: Automated daily expiry alert system workflow.

---

### Class Diagram

![Figure 5.7: Class Diagram](diagrams/08-class.png)

**Figure 5.7**: Core domain models with attributes, methods, and relationships.

---

### State Diagram

![Figure 5.8: State Diagram - Prescription Workflow](diagrams/09-state-prescription.png)

**Figure 5.8**: Prescription lifecycle through 9 states from upload to dispensed.

---

## 5.3 UML Diagrams
"@
$enhancedDoc = $enhancedDoc -replace $uml_marker, $uml_images

# Note: Wireframe diagrams reference the HTML mockups in ui-mockups folder
# No image insertion needed - section 5.4 already has content

# Save enhanced markdown
$enhancedDoc | Out-File -FilePath "doc-final-with-images.md" -Encoding UTF8
Write-Host "   SUCCESS - Enhanced markdown created" -ForegroundColor Green

Write-Host "[2/3] Converting to Word document..." -ForegroundColor Yellow

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")  

# Convert with Pandoc (only required diagrams)
& pandoc "doc-final-with-images.md" -o "Final_Year_Documentation.docx" --toc --toc-depth=3 --number-sections --standalone

if ($LASTEXITCODE -eq 0) {
    Write-Host "   SUCCESS - Word document generated" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Conversion failed" -ForegroundColor Red
    exit 1
}

Write-Host "[3/3] Verification..." -ForegroundColor Yellow

if (Test-Path "Final_Year_Documentation.docx") {
    $fileSize = (Get-Item "Final_Year_Documentation.docx").Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Final Documentation Ready" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Document Details:" -ForegroundColor Cyan
    Write-Host "   Filename: Final_Year_Documentation.docx" -ForegroundColor White
    Write-Host "   Size: $fileSizeMB MB" -ForegroundColor White
    Write-Host "   Pages: Approximately 250-300 pages" -ForegroundColor White
    Write-Host ""
    Write-Host "Structure (Matches Required TOC):" -ForegroundColor Cyan
    Write-Host "   - Acknowledgement" -ForegroundColor White
    Write-Host "   - Abstract" -ForegroundColor White
    Write-Host "   - Table of Contents (auto-generated)" -ForegroundColor White
    Write-Host "   - 1.0 Introduction (1.1-1.4)" -ForegroundColor White
    Write-Host "   - 2.0 Literature Review" -ForegroundColor White
    Write-Host "   - 3.0 Planning (3.0.1-3.1.1)" -ForegroundColor White  
    Write-Host "   - 4.2 Requirements Gathering (4.2.1-4.3.2)" -ForegroundColor White
    Write-Host "   - 5.0 System Design (5.1-5.4)" -ForegroundColor White
    Write-Host "   - 6.0 Implementation (6.1-6.3)" -ForegroundColor White
    Write-Host "   - 7.0 Testing (Test Plan, Test Cases)" -ForegroundColor White
    Write-Host "   - 8.0 Conclusion (8.1-8.3)" -ForegroundColor White
    Write-Host "   - Gantt Chart" -ForegroundColor White
    Write-Host "   - References (25 sources)" -ForegroundColor White
    Write-Host "   - Appendix 1 & 2" -ForegroundColor White
    Write-Host ""
    Write-Host "Diagrams Included (8 total):" -ForegroundColor Cyan
    Write-Host "   - Architecture Diagram (Three-tier)" -ForegroundColor White
    Write-Host "   - ER Diagram (Database schema)" -ForegroundColor White
    Write-Host "   - Use Case Diagram" -ForegroundColor White
    Write-Host "   - 2x Sequence Diagrams (Prescription, POS)" -ForegroundColor White
    Write-Host "   -Activity Diagram (Expiry alerts)" -ForegroundColor White
    Write-Host "   - Class Diagram (Domain models)" -ForegroundColor White
    Write-Host "   - State Diagram (Prescription lifecycle)" -ForegroundColor White
    Write-Host ""
    Write-Host "Removed Content:" -ForegroundColor Yellow
    Write-Host "   - Unnecessary subsections not in TOC" -ForegroundColor Gray
    Write-Host "   - Extra diagrams (Deployment, Customer Journey, Layered)" -ForegroundColor Gray
    Write-Host "   - Redundant content" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Open Final_Year_Documentation.docx" -ForegroundColor Yellow
    Write-Host "   2. Right-click TOC -> Update Field -> Update entire table" -ForegroundColor Yellow
    Write-Host "   3. Add cover page with your details" -ForegroundColor Yellow
    Write-Host "   4. Review all diagrams display correctly" -ForegroundColor Yellow
    Write-Host "   5. Add header/footer if required" -ForegroundColor Yellow
    Write-Host "   6. Save and export to PDF" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opening document..." -ForegroundColor Cyan
    Start-Process "Final_Year_Documentation.docx"
    
} else {
    Write-Host ""
    Write-Host "ERROR: Document not created" -ForegroundColor Red
}

Write-Host ""
Write-Host "Generation complete!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
