# PowerShell script to restructure doc.md to match required TOC
# Removes unnecessary sections and reorders content

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Documentation Restructuring Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Reading source documentation..." -ForegroundColor Yellow
$sourceDoc = Get-Content "doc.md" -Raw

Write-Host "[2/3] Restructuring to required TOC..." -ForegroundColor Yellow

# Create restructured content with exact TOC structure
$restructured = @"
# AI-Enhanced Pharmacy Management System
## Final Year Project Documentation

**Student Name:** [Your Name]  
**Student ID:** [Your ID]  
**Supervisor:** [Supervisor Name]  
**Date:** March 2026

---

"@

# Extract Acknowledgement (Lines 10-27)
$restructured += ($sourceDoc -split "`n")[9..26] -join "`n"
$restructured += "`n`n---`n`n"

# Extract Abstract (Lines 29-61)
$restructured += ($sourceDoc -split "`n")[28..60] -join "`n"
$restructured += "`n`n---`n`n"

# Add new TOC matching required structure
$restructured += @"
# Table of Contents

- Acknowledgement ............................................................... i  
- Abstract ...................................................................... ii

1. Introduction ................................................................. 13
   - 1.1 Background Studies ..................................................... 14
   - 1.2 Problem Statement ...................................................... 15
   - 1.3 Objective .............................................................. 16
   - 1.4 Solutions .............................................................. 17

2. Literature Review ............................................................ 18

3. Planning ..................................................................... 22
   - 3.0.1 Feasibility Report ................................................... 22
   - 3.0.2 Risk Assessment ...................................................... 22
   - 3.0.3 SWOT ................................................................. 22
   - 3.0.4 PESTAL Analysis ...................................................... 23
   - 3.0.5 Life Cycle Model ..................................................... 23
   - 3.1.1 Time Plan ............................................................ 23

4. Requirement Gathering and Analysis ........................................... 26
   - 4.2.1 Requirement Gathering technique used for the project ................. 26
   - 4.2.2 Questionnaire ........................................................ 27
   - 4.2.3 Interview ............................................................ 31
   - Summary of the Interview and Questionnaire ................................. 32
   - 4.3 Functional and Non-Functional Requirements ............................. 33
     - 4.3.1 Functional Requirements ............................................ 33
     - 4.3.2 Non-functional Requirement ......................................... 34

5. System Design ................................................................ 37
   - 5.1 Architecture Diagram ................................................... 37
   - 5.2 ER Diagram ............................................................. 37
   - 5.3 UML Diagrams ........................................................... 38
   - 5.4 Wireframe Diagram ...................................................... 49

6. Implementation ............................................................... 62
   - 6.1 Technology Stack ....................................................... 62
   - 6.2 Design patterns ........................................................ 62
   - 6.3 Implementation of the program .......................................... 64

7. Testing and Validation ....................................................... 80
   - Test Plan .................................................................. 81
   - Test Cases ................................................................. 81

8. Conclusion ................................................................... 85
   - 8.1 Conclusion ............................................................. 86
   - 8.2 Future Recommendations ................................................. 86
   - 8.3 Lessons Learned ........................................................ 86

Gantt Chart ..................................................................... 87
References ...................................................................... 88

Appendix 1 ...................................................................... 90
   - Questionnaire and answers .................................................. 90
   - Source codes ............................................................... -
   - Test Case .................................................................. 95

Appendix 2
   - Supervision meeting log sheets

---

"@

# Now extract each section in order...

Write-Host "   Extracting Section 1: Introduction..." -ForegroundColor Gray

# Find section boundaries by searching for headers
function Get-SectionContent {
    param (
        [string]$content,
        [string]$startPattern,
        [string]$endPattern
    )
    
    $lines = $content -split "`n"
    $startIdx = -1
    $endIdx = $lines.Count
    
    for ($i = 0; $i < $lines.Count; $i++) {
        if ($lines[$i] -match $startPattern) {
            $startIdx = $i
        }
        if ($startIdx -ge 0 -and $lines[$i] -match $endPattern -and $i -gt $startIdx) {
            $endIdx = $i
            break
        }
    }
    
    if ($startIdx -ge 0) {
        return $lines[$startIdx..($endIdx-1)] -join "`n"
    }
    return ""
}

# Extract Section 1 (Introduction) - Lines 89-478
$section1_start = 88
$section1_end = 494
$section1 = ($sourceDoc -split "`n")[$section1_start..$section1_end] -join "`n"
$restructured += $section1 + "`n`n---`n`n"

Write-Host "   Extracting Section 2: Literature Review..." -ForegroundColor Gray
# Extract Section 2 (Literature Review) - Lines 495-869  
$section2_start = 494
$section2_end = 868
$section2 = ($sourceDoc -split "`n")[$section2_start..$section2_end] -join "`n"
$restructured += $section2 + "`n`n---`n`n"

Write-Host "   Extracting Section 3: Planning..." -ForegroundColor Gray
# Extract Section 3 (Planning) - Lines 870-2034
$section3_start = 869
$section3_end = 2033
$section3 = ($sourceDoc -split "`n")[$section3_start..$section3_end] -join "`n"
$restructured += $section3 + "`n`n---`n`n"

Write-Host "   Extracting Section 4: Requirements..." -ForegroundColor Gray
# Extract Section 4 (Requirements) - Lines 2036-3134
$section4_start = 2035
$section4_end = 3133
$section4 = ($sourceDoc -split "`n")[$section4_start..$section4_end] -join "`n"
$restructured += $section4 + "`n`n---`n`n"

Write-Host "   Extracting Section 5: System Design..." -ForegroundColor Gray
# Extract Section 5 (System Design) - Lines 3136-3590
$section5_start = 3135
$section5_end = 3589
$section5 = ($sourceDoc -split "`n")[$section5_start..$section5_end] -join "`n"
$restructured += $section5 + "`n`n---`n`n"

Write-Host "   Extracting Section 6: Implementation..." -ForegroundColor Gray
# Extract Section 6 (Implementation) - Lines 3592-4506
$section6_start = 3591
$section6_end = 4505
$section6 = ($sourceDoc -split "`n")[$section6_start..$section6_end] -join "`n"
$restructured += $section6 + "`n`n---`n`n"

Write-Host "   Extracting Section 7: Testing..." -ForegroundColor Gray
# Extract Section 7 (Testing) - Lines 4508-4923
$section7_start = 4507
$section7_end = 4922
$section7 = ($sourceDoc -split "`n")[$section7_start..$section7_end] -join "`n"

# Restructure Section 7 to have Test Plan and Test Cases as main subsections
$section7 = $section7 -replace '## 7\.1 Testing Strategy', '## Test Plan'
$section7 = $section7 -replace '## 7\.2 Unit Testing', '## Test Cases`n`n### Unit Testing'
$section7 = $section7 -replace '## 7\.3 Integration Testing', '### Integration Testing'  
$section7 = $section7 -replace '## 7\.4', '### 7.4'
$section7 = $section7 -replace '## 7\.5', '### 7.5'
$section7 = $section7 -replace '## 7\.6', '### 7.6'
$section7 = $section7 -replace '## 7\.7', '### 7.7'
$section7 = $section7 -replace '## 7\.8', '### 7.8'
$section7 = $section7 -replace '## 7\.9', '### 7.9'

$restructured += $section7 + "`n`n---`n`n"

Write-Host "   Restructuring Section 8: Conclusion..." -ForegroundColor Gray
# Extract and restructure Section 8 (Conclusion) - Lines 4925-5261
$section8_lines = ($sourceDoc -split "`n")[4924..5260]

# Build new Section 8 structure
$restructured += "# 8. Conclusion`n`n"

# 8.1 Conclusion (from 8.1 Project Summary)
$conclusion_start = 0
$conclusion_end = 0
for ($i = 0; $i < $section8_lines.Count; $i++) {
    if ($section8_lines[$i] -match '## 8\.1') { $conclusion_start = $i }
    if ($section8_lines[$i] -match '## 8\.2') { $conclusion_end = $i; break }
}
$restructured += "## 8.1 Conclusion`n`n"
$restructured += ($section8_lines[$conclusion_start..$conclusion_end] -join "`n" -replace '## 8\.1 Project Summary', '') + "`n`n"

# 8.2 Future Recommendations (from 8.4 Future Work and Recommendations)
$future_start = 0
$future_end = 0
for ($i = 0; $i < $section8_lines.Count; $i++) {
    if ($section8_lines[$i] -match '## 8\.4') { $future_start = $i }
    if ($section8_lines[$i] -match '## 8\.5') { $future_end = $i; break }
}
$restructured += "## 8.2 Future Recommendations`n`n"
$restructured += ($section8_lines[$future_start..$future_end] -join "`n" -replace '## 8\.4 Future Work and Recommendations', '') + "`n`n"

# 8.3 Lessons Learned (from 8.5)
$lessons_start = 0
for ($i = 0; $i < $section8_lines.Count; $i++) {
    if ($section8_lines[$i] -match '## 8\.5') { $lessons_start = $i; break }
}
$restructured += "## 8.3 Lessons Learned`n`n"
$restructured += ($section8_lines[$lessons_start..($section8_lines.Count-1)] -join "`n" -replace '## 8\.5 Lessons Learned', '') + "`n`n"

$restructured += "---`n`n"

Write-Host "   Extracting Gantt Chart..." -ForegroundColor Gray
# Extract Gantt Chart - Lines ~5263-5380
$gantt_start = 5262
$gantt_end = 5379
$gantt = ($sourceDoc -split "`n")[$gantt_start..$gantt_end] -join "`n"
$restructured += $gantt + "`n`n---`n`n"

Write-Host "   Extracting References..." -ForegroundColor Gray
# Extract References - Lines ~5382-5540
$ref_start = 5381
$ref_end = 5539
$references = ($sourceDoc -split "`n")[$ref_start..$ref_end] -join "`n"
$restructured += $references + "`n`n---`n`n"

Write-Host "   Extracting Appendices..." -ForegroundColor Gray
# Extract Appendix 1 and 2 - Lines ~5542-end
$app_start = 5541
$appendices = ($sourceDoc -split "`n")[$app_start..($sourceDoc.Count-1)] -join "`n"
$restructured += $appendices

# Save restructured document
Write-Host "[3/3] Saving restructured document..." -ForegroundColor Yellow
$restructured | Out-File -FilePath "doc-restructured.md" -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " SUCCESS! Document Restructured" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output: doc-restructured.md" -ForegroundColor White
Write-Host ""
Write-Host "Changes Made:" -ForegroundColor Cyan
Write-Host "  - Reordered Section 8 (Conclusion)" -ForegroundColor White
Write-Host "    8.1: Project Summary -> Conclusion" -ForegroundColor Gray
Write-Host "    8.2: Future Work -> Future Recommendations" -ForegroundColor Gray
Write-Host "    8.3: Lessons Learned (moved from 8.5)" -ForegroundColor Gray
Write-Host "  - Removed Section 8.2 (Contributions) and 8.3 (Limitations)" -ForegroundColor White
Write-Host "  - Restructured Section 7 (Test Plan, Test Cases)" -ForegroundColor White
Write-Host "  - Updated Table of Contents to match requirements" -ForegroundColor White
Write-Host ""
