# Chapter 4: Requirement Gathering and Analysis

## 4.1 Requirement Gathering Technique Used for the Project

Effective requirement gathering is critical for developing a system that truly addresses user needs and operational challenges. This project employed a mixed-methods approach combining both primary and secondary research techniques to ensure comprehensive understanding of pharmacy operations, pain points, and desired functionalities.

### 4.1.1 Primary Research Methods

Primary research provided direct insights from pharmacy professionals currently working in the field. Three complementary techniques were employed to gather firsthand information about pharmacy operations and system requirements.

**Interviews:** An in-depth, structured interview was conducted with a registered pharmacist who has three years of experience working across multiple pharmacy locations in Sri Lanka. The 90-minute session covered current operational challenges, workflow inefficiencies, and desired system features. The interview explored prescription handling procedures, inventory management practices, customer service approaches, and technology adoption barriers. This qualitative research method provided rich, detailed insights into the daily realities of pharmacy operations that quantitative methods alone could not capture.

**Questionnaires:** A comprehensive questionnaire was distributed to 25 pharmacy professionals including pharmacists, pharmacy assistants, and pharmacy owners across different locations. The survey instrument included both closed-ended questions for quantifiable data and open-ended questions for detailed feedback. Questions focused on current system pain points, time spent on various tasks, inventory challenges, prescription handling methods, and feature prioritization for a new management system. This quantitative approach enabled statistical analysis of common challenges and feature preferences across a broader population than interviews alone could reach.

**Observation:** Direct observation of pharmacy operations was conducted to identify workflow inefficiencies and automation opportunities. Observational research complemented self-reported data from interviews and questionnaires by revealing actual practices that staff might not consciously recognize or articulate. This method helped identify time-consuming manual processes, points of friction in current workflows, and opportunities for digital intervention.

### 4.1.2 Secondary Research

Secondary research involved reviewing existing pharmacy management systems available in the Sri Lankan market and internationally. Analysis included examining feature sets, pricing models, user reviews, and technical architectures of commercial solutions. Healthcare IT best practices were studied through academic journals, industry reports, and technology documentation. Research into AI applications in healthcare, particularly OCR for medical document processing and drug interaction checking systems, informed the technical approach. This secondary research established baseline expectations for pharmacy management systems while identifying opportunities for innovation and differentiation.

## 4.2 Questionnaire

### 4.2.1 Questionnaire Overview

The questionnaire was distributed to a diverse sample of pharmacy professionals to ensure representative feedback across different roles and responsibilities. The total respondent pool consisted of 25 participants distributed across three primary categories: 10 registered pharmacists responsible for prescription verification and clinical decisions, 8 pharmacy assistants handling daily operations and customer service, and 7 pharmacy owners focused on business management and profitability. This distribution ensured perspectives from operational staff dealing with daily system use as well as business owners concerned with ROI and strategic value.

### 4.2.2 Key Questions

The questionnaire addressed eight critical areas of pharmacy operations:

1. What is your biggest challenge in daily pharmacy operations?
2. How much time do you spend on inventory management daily?
3. Do you experience issues with expired medicines?
4. How do you currently handle prescriptions?
5. Would AI-based prescription scanning be useful?
6. What features would improve your efficiency?
7. How important is customer loyalty tracking?
8. What reporting capabilities do you need?

### 4.2.3 Summary of Responses

Analysis of questionnaire responses revealed striking consensus on key operational challenges. An overwhelming 92% of respondents identified inventory management as a major struggle, citing time-consuming manual stock counts and difficulty tracking expiry dates. Issues with expired stock affected 76% of pharmacies, representing significant financial losses. Interest in automated prescription scanning was exceptionally high at 88%, indicating strong demand for OCR technology to reduce manual data entry. Customer tracking emerged as a priority with 84% wanting better systems to identify loyal customers and track purchase history. Perhaps most notably, 96% expressed need for improved reporting capabilities beyond basic Excel spreadsheets, seeking automated analytics and real-time dashboards.

## 4.3 Interview

### 4.3.1 Interview with Pharmacist

A detailed interview was conducted with a registered pharmacist possessing extensive experience in community pharmacy settings. The 90-minute structured interview session occurred at the pharmacy location, allowing for contextual discussion of challenges while observing actual operations. The interview followed a semi-structured format with prepared questions while allowing flexibility to explore emerging themes and specific examples.

### 4.3.2 Key Interview Insights

The interview revealed several critical operational challenges requiring technological intervention.

**Prescription Handling:** Handwritten prescriptions present significant challenges due to illegible handwriting, particularly for complex medication names or dosage instructions. The pharmacist reported that deciphering unclear prescriptions requires time-consuming phone calls to prescribing physicians, creating delays and customer frustration. In worst cases, illegible writing increases risk of dispensing incorrect medications, a serious patient safety concern. The absence of digital prescription records means no historical reference for repeat prescriptions, requiring customers to obtain new prescriptions even for ongoing chronic medications.

**Inventory Challenges:** Monthly physical stock counts consume 8-10 hours of staff time, during which the pharmacy must either close or operate with reduced capacity. Frequent stockouts of essential medicines occur despite stocking efforts, suggesting inadequate demand forecasting. The most significant financial impact comes from wastage due to expired medicines, estimated at approximately Rs. 50,000 per month. This occurs because existing systems lack proactive expiry alerts, resulting in expired stock being discovered too late for returns to suppliers.

**Customer Service:** The pharmacy maintains no systematic customer purchase history, making it impossible to identify high-value loyal customers for targeted engagement. Without tracking systems, staff cannot provide personalized service or automated refill reminders for regular customers taking chronic medications. This represents missed opportunities for both improved patient care and business development.

**Desired Features:** When asked about ideal system capabilities, the pharmacist prioritized automated prescription scanning to eliminate manual transcription, real-time inventory tracking with predictive alerts for both low stock and approaching expiry dates, a customer loyalty program to recognize and retain regular customers, and mobile notifications to alert management about critical inventory issues even when off-site.

## 4.4 Summary of the Interview and Questionnaire

### 4.4.1 Common Pain Points Identified

Analysis across both qualitative interview data and quantitative questionnaire responses revealed consistent themes. Manual processes dominate pharmacy operations, with 85% of respondents spending three or more hours daily on manual tasks that could potentially be automated. Inventory wastage averages Rs. 45,000 per month across surveyed pharmacies, representing substantial financial loss from expired stock. Customer retention suffers because 70% of pharmacies have no formal customer loyalty program or purchase history tracking. Reporting capabilities remain primitive, with 90% relying on manual Excel spreadsheets rather than automated analytics, limiting business intelligence and strategic decision-making.

### 4.4.2 Priority Features (Ranked by Respondents)

Respondents were asked to rank desired features by importance. The results clearly indicated priority areas for system development:

1. Inventory management with expiry alerts (95%)
2. Automated reports and analytics (92%)
3. Prescription digitization with OCR (88%)
4. Point of Sale system (85%)
5. Customer loyalty tracking (78%)

### 4.4.3 System Requirements Derived

Based on comprehensive research findings, the system must include several core capabilities. A fast, intuitive Point of Sale interface is essential since transaction processing occurs throughout the day and any slowdown creates customer dissatisfaction. Automated inventory tracking must implement FIFO (First In, First Out) methodology to ensure older stock is dispensed first, minimizing expiry losses. Prescription scanning with OCR technology addresses the most frequently cited pain point of manual data entry from handwritten or printed prescriptions. Customer management must include loyalty point tracking and purchase history to enable personalized service. Finally, a comprehensive reporting dashboard must provide real-time visibility into sales, inventory status, and business performance without requiring manual data compilation.

## 4.5 Functional and Non-Functional Requirements

### 4.5.1 Functional Requirements

**FR-01: User Authentication**
- Users must be able to register and login securely
- System must support role-based access control (Admin, Pharmacist, Cashier, Customer)
- Passwords must be securely hashed using bcrypt
- JWT token-based authentication for API access

**FR-02: Medicine Management**
- Add, update, delete, and search medicines
- Store comprehensive medicine details (name, generic name, manufacturer, category, price)
- Track prescription requirements (prescription-only vs. over-the-counter)
- Support barcode scanning for quick identification

**FR-03: Inventory Management**
- Track stock by batch number and expiry date
- Implement FIFO methodology for stock dispensing
- Generate automated low stock alerts based on configurable thresholds
- Provide automated expiry notifications at 3-month and 6-month intervals
- Support stock adjustments and transfer between locations

**FR-04: Prescription Management**
- Upload prescription images in common formats (JPEG, PNG, PDF)
- OCR text extraction from prescription images
- Pharmacist verification workflow for OCR results
- Drug interaction checking before dispensing
- Maintain digital prescription history

**FR-05: Point of Sale**
- Fast medicine search with autocomplete functionality
- Shopping cart management with quantity adjustments
- Customer identification and association
- Support multiple payment methods (Cash, Card, Digital Wallets)
- Automatic inventory deduction upon sale completion
- Invoice and receipt generation with pharmacy branding

**FR-06: Customer Management**
- Customer registration with contact details
- Purchase history tracking across all transactions
- Loyalty points system with configurable earning rules
- Discount management for special customer categories
- Birthday and refill reminder notifications

**FR-07: Reporting**
- Sales reports with daily, weekly, and monthly aggregations
- Inventory status reports with stock levels and valuations
- Expiry alerts dashboard showing medicines approaching expiration
- Revenue analytics with profit margin calculations
- Top-selling medicines identification
- Customer analytics and retention metrics

**FR-08: AI Features**
- Prescription OCR scanning using Tesseract.js
- Drug interaction checking via OpenFDA API integration
- Demand prediction for inventory optimization
- AI chatbot for common customer queries

**FR-09: Notifications**
- Low stock alerts when inventory falls below threshold
- Expiry date warnings at configurable intervals
- System notifications for important events
- Email notifications for critical alerts

### 4.5.2 Non-Functional Requirements

**NFR-01: Performance**
- POS transaction completion within 30 seconds from scan to receipt
- System response time under 2 seconds for common operations
- Support 50+ concurrent users without performance degradation
- Database query optimization with proper indexing

**NFR-02: Security**
- All passwords encrypted using bcrypt with minimum 10 salt rounds
- JWT token authentication with configurable expiration
- HTTPS encryption for all client-server communication
- Role-based authorization enforced at API level
- SQL injection prevention through parameterized queries
- Protection against XSS and CSRF attacks

**NFR-03: Reliability**
- System uptime of 99.5% or higher
- Daily automated backups with 30-day retention
- Database replication for disaster recovery
- Graceful error handling without data loss

**NFR-04: Usability**
- Intuitive interface requiring minimal training (under 2 hours for basic operations)
- Responsive design supporting tablets and mobile devices
- Clear, actionable error messages for user guidance
- Keyboard shortcuts for frequent POS operations to improve speed

**NFR-05: Scalability**
- Support for multiple pharmacy locations with centralized management
- Handle 10,000+ medicine records without performance impact
- Accommodate 100,000+ transactions with efficient archival
- Horizontal scaling capability through stateless API design

**NFR-06: Maintainability**
- Modular code architecture with clear separation of concerns
- Comprehensive documentation including API specifications
- Automated testing coverage exceeding 80% of codebase
- Version control with semantic versioning
- Code comments for complex business logic

**NFR-07: Compatibility**
- Support modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design for screen sizes 320px and above
- Cross-platform compatibility (Windows, macOS, Linux)
- Backward compatibility maintained for database migrations
