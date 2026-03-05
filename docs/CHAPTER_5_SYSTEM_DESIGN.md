# Chapter 5: System Design

## 5.1 Architecture Diagram

The Intelligent Pharmacy Management System employs a modern three-tier architecture that separates concerns between presentation, business logic, and data persistence. This architectural pattern provides modularity, maintainability, and scalability while facilitating independent development and testing of each layer.

**[INSERT DIAGRAM: diagrams/01-architecture.png - System Architecture]**

The system follows a three-tier architecture with clear separation of responsibilities:

**Presentation Layer:** The frontend is built using React 18, leveraging its component-based architecture and virtual DOM for optimal performance. Material-UI (MUI) provides pre-built, accessible components ensuring consistent user experience across the application. The presentation layer communicates with the backend exclusively through RESTful API calls over HTTPS, maintaining stateless interactions. State management is handled through Zustand for global application state and React hooks for component-level state.

**Application Layer:** The backend utilizes Node.js runtime with Express framework to build a robust REST API. TypeScript adds type safety throughout the application, reducing runtime errors and improving developer productivity. This layer contains all business logic including inventory calculations, prescription validation, sales processing, and AI service orchestration. JWT-based authentication middleware protects routes, while role-based access control ensures users can only access authorized resources. The application layer acts as the intermediary between the presentation layer and data layer, processing requests, enforcing business rules, and coordinating data operations.

**Data Layer:** PostgreSQL serves as the relational database management system, chosen for its ACID compliance, robust transaction support, and excellent performance with complex queries. Sequelize ORM provides an abstraction layer over raw SQL, offering model-based database interactions with built-in validation, associations, and migration support. This layer handles all data persistence, retrieval, and integrity constraints. Database indexing on frequently queried columns ensures optimal query performance even with large datasets.

**External Services:** The system integrates several specialized AI and data services to enhance functionality. Tesseract.js provides optical character recognition for extracting text from prescription images, achieving 70-85% accuracy on clear images. Natural.js offers natural language processing capabilities for parsing prescription instructions and identifying dosage information. OpenFDA API serves as an external drug information database, enabling drug interaction checking and safety validation. TensorFlow.js powers the demand prediction feature, using historical sales data to forecast future inventory needs.

## 5.2 ER Diagram

The Entity-Relationship Diagram illustrates the database schema, showing all entities, their attributes, and the relationships between them. This schema is designed to eliminate data redundancy through normalization while maintaining intuitive relationships that reflect real-world pharmacy operations.

**[INSERT DIAGRAM: diagrams/02-erd.png - Entity Relationship Diagram]**

### 5.2.1 Core Entities

**USERS:** Stores system user accounts for staff members who access the application. Key attributes include id (primary key), username (unique identifier for login), email (for communication and password recovery), password_hash (bcrypt-hashed password for security), role (enum: admin, pharmacist, cashier defining access permissions), and created_at (account creation timestamp).

**CUSTOMERS:** Maintains customer information for pharmacy patrons. Attributes include id (primary key), name (customer full name), phone (contact number, used for quick customer lookup during POS transactions), email (for digital receipts and notifications), address (delivery information if applicable), loyalty_points (accumulated points from purchases), and created_at (registration date).

**MEDICINES:** Central entity storing pharmaceutical product information. Contains id (primary key), name (brand or trade name), generic_name (active ingredient name for substitution identification), manufacturer (pharmaceutical company), category (therapeutic classification), price (retail selling price), dosage_form (tablet, capsule, syrup, etc.), and requires_prescription (boolean flag indicating prescription requirement).

**INVENTORY:** Tracks physical stock with batch-level granularity essential for pharmacy operations. Attributes include id (primary key), medicine_id (foreign key to MEDICINES), supplier_id (foreign key to SUPPLIERS), batch_number (manufacturer's batch identifier for recalls and quality tracking), quantity (current stock level for this batch), expiry_date (critical for expiry monitoring and FIFO dispensing), purchase_price (cost basis for profit calculation), and received_date (when stock was added to inventory).

**SALES:** Records completed transactions. Contains id (primary key), customer_id (foreign key to CUSTOMERS, nullable for walk-in customers), user_id (foreign key to USERS identifying the cashier who processed the sale), prescription_id (foreign key to PRESCRIPTIONS if transaction involved prescription medication, nullable), total_amount (final transaction total after discounts), discount (amount deducted from subtotal), payment_method (enum: cash, card, digital), and created_at (transaction timestamp).

**SALES_ITEMS:** Line items within each sale transaction, following the normalized design pattern to handle multiple medicines per sale. Attributes include id (primary key), sale_id (foreign key to SALES), medicine_id (foreign key to MEDICINES), quantity (number of units sold), unit_price (price per unit at time of sale, stored to preserve historical pricing), and subtotal (calculated as quantity × unit_price).

**PRESCRIPTIONS:** Manages prescription documents and their OCR processing workflow. Contains id (primary key), customer_id (foreign key to CUSTOMERS), image_url (path to uploaded prescription image file), extracted_text (raw OCR output from Tesseract.js), verified_text (pharmacist-corrected version of extracted text), status (enum: uploaded, processing, pending, verified, dispensed tracking the prescription lifecycle), verified_by (foreign key to USERS identifying the pharmacist who verified), and created_at (upload timestamp).

**SUPPLIERS:** Stores pharmaceutical supplier information for inventory sourcing. Attributes include id (primary key), name (company name), contact_person (representative name), phone (contact number), email (for purchase orders and communications), and address (supplier location).

**PURCHASE_ORDERS:** Manages procurement workflow for restocking inventory. Contains id (primary key), supplier_id (foreign key to SUPPLIERS), status (enum: pending, approved, received, cancelled), total_amount (order value), order_date (when order was placed), expected_delivery (anticipated arrival date), and created_by (foreign key to USERS indicating who initiated the order).

**NOTIFICATIONS:** Implements the notification system for alerts and reminders. Attributes include id (primary key), user_id (foreign key to USERS indicating recipient), title (notification headline), message (detailed notification content), type (enum: low_stock, expiry_warning, system categorizing the notification), is_read (boolean flag for read status), and created_at (when notification was generated).

### 5.2.2 Relationships

The database schema implements several one-to-many relationships reflecting real-world business rules:

**Users → Sales (1:N):** One user (cashier) can process many sales transactions, but each sale is processed by exactly one user. This enables tracking of individual cashier performance and accountability.

**Customers → Sales (1:N):** One customer can make many purchases over time, but each sale belongs to one customer. This relationship enables purchase history tracking and loyalty point accumulation.

**Medicines → Inventory (1:N):** One medicine can have multiple inventory batches with different expiry dates and suppliers, but each inventory record references one medicine. This supports FIFO inventory management and batch tracking for recalls.

**Suppliers → Inventory (1:N):** One supplier provides many inventory batches across different medicines, but each batch comes from one supplier. This relationship supports supplier performance analysis and procurement decisions.

**Sales → SalesItems (1:N):** One sale can contain multiple line items for different medicines, but each line item belongs to one sale. This normalized structure prevents data redundancy when customers purchase multiple items.

**Customers → Prescriptions (1:N):** One customer can upload many prescriptions over time, but each prescription belongs to one customer. This maintains prescription history for regulatory compliance and customer service.

## 5.3 UML Diagrams

Unified Modeling Language diagrams provide multiple perspectives on system behavior, structure, and interactions. These diagrams serve as comprehensive documentation for developers and stakeholders while facilitating clear communication about system design.

### 5.3.1 Use Case Diagram

The use case diagram illustrates the functional requirements from the user's perspective, showing what each type of actor can do within the system. This diagram helps validate that all stakeholder needs are addressed in the system design.

**[INSERT DIAGRAM: diagrams/03-usecase.png - Use Case Diagram]**

**Actors:**
- **Admin:** System administrator with full access to user management, system configuration, and all reporting features
- **Pharmacist:** Licensed pharmacy professional who verifies prescriptions, manages medicines, oversees inventory, and accesses analytics
- **Cashier:** Staff member who processes sales transactions, manages customer interactions, and handles payments
- **Customer:** Pharmacy patron who can upload prescriptions and view their purchase history (if customer portal is implemented)

**Use Cases:**

**User Management (Admin):** Creating new user accounts, updating user information, deleting inactive accounts, assigning role-based permissions, and viewing all system users.

**Medicine Management (Admin, Pharmacist):** Adding new medicines to the catalog, updating medicine information (pricing, category, prescription requirements), searching medicines by name or generic name, and viewing detailed medicine information.

**Inventory Management (Pharmacist):** Adding new stock batches with expiry dates and batch numbers, updating inventory quantities, tracking batch-level inventory, monitoring expiry dates with automated alerts, and viewing comprehensive inventory status.

**Prescription Processing (Pharmacist, Customer):** Customers upload prescription images, system performs OCR scanning to extract text, pharmacists review and verify extracted information, and medicines are dispensed through the POS system.

**Point of Sale (Cashier):** Processing sales transactions with medicine lookup, generating invoices with itemized details, processing payments through multiple methods, and applying discounts based on loyalty points or manual entry.

**Customer Management (Cashier):** Registering new customers, viewing customer purchase history for better service, and managing loyalty points accumulation and redemption.

**Reports & Analytics (Admin, Pharmacist):** Generating sales reports with daily, weekly, and monthly aggregations, inventory reports showing stock levels and valuations, dashboard analytics with key performance indicators, and exporting reports to PDF or Excel formats.

### 5.3.2 Sequence Diagrams

Sequence diagrams show the chronological flow of messages between objects during specific scenarios. These diagrams are particularly valuable for understanding complex workflows involving multiple system components and external services.

#### 5.3.2.1 Prescription Processing Workflow

This sequence diagram illustrates the complete journey of a prescription from initial upload through OCR processing, pharmacist verification, drug interaction checking, and final dispensing.

**[INSERT DIAGRAM: diagrams/04-sequence-prescription.png - Prescription Processing Sequence]**

**Workflow Steps:**

1. **Customer uploads prescription image:** Customer navigates to the prescription upload interface and selects an image file (JPEG, PNG, or PDF) from their device. The frontend validates file type and size before proceeding.

2. **System processes image with OCR:** The React frontend sends the image to the Express backend via multipart form-data POST request. The backend saves the image file and initiates Tesseract.js OCR processing in the background. OCR accuracy ranges from 70-85% depending on image quality, handwriting clarity, and lighting conditions.

3. **Text extracted and saved to database:** Once OCR processing completes, the extracted text is stored in the PRESCRIPTIONS table with status set to "pending". The prescription record includes both the image URL and extracted text for pharmacist review.

4. **Pharmacist reviews and verifies:** The pharmacist accesses the prescription review interface, viewing the original image side-by-side with OCR-extracted text. The pharmacist corrects any extraction errors, adds missing information, and confirms that the prescription is valid and complete.

5. **System checks drug interactions via OpenFDA:** Before marking the prescription as verified, the system automatically queries the OpenFDA API with the extracted medicine names to identify potential drug-drug interactions, contraindications, or safety warnings. Critical warnings are flagged for pharmacist attention.

6. **Prescription marked as verified:** Upon pharmacist approval and successful interaction checking, the prescription status updates to "verified" and is marked ready for dispensing. The verified_by field records which pharmacist approved the prescription for audit trail purposes.

7. **Medicine dispensed through POS:** When the customer arrives to collect the medicines, the cashier accesses the POS system, links the verified prescription to the transaction, processes payment, generates an invoice, and automatically updates inventory using FIFO methodology to deduct from the oldest batches first.

#### 5.3.2.2 POS Transaction Flow

This sequence diagram details the point-of-sale workflow from initial medicine search through payment processing, inventory updates, and invoice generation.

**[INSERT DIAGRAM: diagrams/05-sequence-pos.png - POS Transaction Sequence]**

**Workflow Steps:**

1. **Cashier searches for medicine:** The cashier uses the POS interface to search for medicines by name, generic name, or barcode. The system provides autocomplete suggestions as the cashier types, displaying available stock quantities and prices.

2. **Adds items to cart:** Selected medicines are added to the transaction cart with specified quantities. The system validates that sufficient stock exists before allowing the addition. The cart displays running subtotals and allows quantity adjustments.

3. **Identifies customer (phone number):** The cashier enters the customer's phone number to link the transaction to the customer record. If found, the system displays customer name, current loyalty points, and purchase history. If not found, the cashier can quickly register a new customer.

4. **Applies discounts (loyalty points):** Available loyalty points are displayed, and the customer can choose to redeem points for discounts. Manual discounts can also be applied by authorized staff based on promotions or special circumstances.

5. **Processes payment:** The cashier selects the payment method (cash, card, or digital wallet) and processes the payment. For cash transactions, the system calculates change due. Card transactions may integrate with payment gateway APIs.

6. **Updates inventory (FIFO):** Upon successful payment, the system automatically deducts sold quantities from inventory using First-In-First-Out methodology. This ensures that older batches closer to expiry are dispensed first, minimizing waste.

7. **Generates invoice:** A detailed invoice is generated containing transaction ID, date/time, itemized list of medicines, quantities, prices, subtotal, discount, total amount, and payment method. The invoice can be printed or emailed to the customer.

8. **Updates customer loyalty points:** Based on the total purchase amount, loyalty points are calculated and added to the customer's account. The calculation formula (typically 1 point per currency unit spent) is configurable in system settings.

### 5.3.3 Activity Diagram

Activity diagrams model workflow processes and business logic, particularly useful for documenting automated background tasks and scheduled jobs.

**[INSERT DIAGRAM: diagrams/06-activity-expiry.png - Expiry Monitoring Activity Diagram]**

This activity diagram illustrates the daily automated job that monitors inventory for expiring medicines and generates appropriate alerts:

**Workflow Process:**

1. **Query inventory for items nearing expiry:** A scheduled cron job runs daily at a configured time (typically early morning before pharmacy opens). The job queries the INVENTORY table for all batches where the expiry_date falls within specified thresholds.

2. **Check expiry dates:** The system evaluates each inventory item against two thresholds: medicines expiring within 3 months are classified as "critical" (urgent action needed), while medicines expiring within 6 months receive "warning" status (monitoring required).

3. **Create notifications:** For each item identified, the system generates a notification record in the NOTIFICATIONS table. Critical alerts (3-month threshold) are marked with high priority and bright red indicators in the UI. Warning alerts (6-month threshold) receive medium priority with yellow indicators.

4. **Send alerts to pharmacists:** Notifications are delivered through multiple channels: in-app notifications appear in the notification panel when pharmacists log in, email alerts are sent to configured pharmacy management email addresses, and optionally SMS alerts for critical items.

5. **Generate summary report:** Finally, the system compiles a comprehensive expiry report listing all flagged items grouped by urgency level. This report includes medicine names, batch numbers, current quantities, expiry dates, estimated value, and recommended actions (return to supplier, discount pricing, etc.). The report is available in the Reports section and can be exported to PDF or Excel.

### 5.3.4 Class Diagram

The class diagram shows the object-oriented structure of the application, including classes, their attributes, methods, and relationships. This diagram is essential for backend developers implementing the business logic layer.

**[INSERT DIAGRAM: diagrams/08-class.png - Class Diagram]**

**Core Classes:**

Each class represents a major entity in the system with its attributes (data properties) and methods (behaviors). Classes include User, Medicine, Inventory, Customer, Sale, SaleItem, Prescription, Supplier, PurchaseOrder, and Notification.

**Attributes:** Each class includes typed attributes matching the database schema. For example, the Medicine class includes: id (number), name (string), genericName (string), manufacturer (string), category (string), price (decimal), dosageForm (string), and requiresPrescription (boolean).

**Methods:** Classes implement CRUD operations (Create, Read, Update, Delete) as class methods. For example, the Medicine class includes methods such as: create(data), findById(id), findByName(name), update(id, data), delete(id), and searchByGenericName(genericName).

**Relationships:** The diagram shows associations, compositions, and aggregations between classes. For example, Sale has a composition relationship with SaleItem (a sale contains sale items), and an association with Customer (a sale is made by a customer).

### 5.3.5 State Diagram

State diagrams model the different states an object can be in throughout its lifecycle and the transitions between those states. This is particularly important for prescription processing, which involves multiple status changes.

**[INSERT DIAGRAM: diagrams/09-state-prescription.png - Prescription State Diagram]**

**Prescription Lifecycle States:**

**Uploaded:** Initial state when customer first uploads a prescription image. The system has received the file and saved it to storage, but no processing has begun yet.

**Processing:** OCR job is actively running. Tesseract.js is analyzing the image, performing text recognition, and attempting to identify medicine names, dosages, and instructions. This typically takes 5-15 seconds depending on image complexity.

**Pending:** OCR processing has completed successfully. The extracted text is now available for pharmacist review. This is a waiting state where the prescription remains until a pharmacist reviews it.

**Under Review:** A pharmacist has opened the prescription and is actively reviewing the OCR-extracted text against the original image, making corrections as needed, and verifying prescription legitimacy.

**Verified:** The pharmacist has approved the prescription as accurate and valid. Drug interaction checking has passed without critical warnings. The prescription is now ready for dispensing.

**Ready to Dispense:** Prescription is approved and awaiting customer arrival for medicine collection. Medicines are available in stock and ready to be sold.

**On Hold:** Special state entered if required medicines are temporarily out of stock. The prescription returns to "Ready to Dispense" state once stock is replenished.

**Dispensing:** Sale transaction is in progress. The cashier has initiated the POS transaction and is completing the payment process.

**Dispensed:** Final successful state. Medicine has been sold, inventory updated, invoice generated, and prescription marked complete.

**Error States:**

**Failed:** OCR processing encountered an error, possibly due to corrupted image file, unsupported format, or processing timeout. Manual prescription entry is required.

**Rejected:** Pharmacist has rejected the prescription as invalid, expired, forged, or otherwise problematic. The prescription cannot be dispensed.

## 5.4 Wireframe Diagrams

Wireframe diagrams provide visual representations of user interface layouts, showing the placement of elements, navigation flow, and information hierarchy. These wireframes were created early in the design process to establish UI/UX patterns before detailed implementation.

### 5.4.1 Key Screens

The system includes 15 primary screens covering all major functional areas:

**Login Dashboard:** User authentication interface with username/password fields, remember me option, password recovery link, and role-based login validation. Clean, minimal design focusing on security and ease of access.

**Dashboard (Analytics):** Main landing page after login displaying key performance indicators in card layouts. Includes total sales (daily/monthly), revenue trends with charts, low stock alerts, expiring medicines warnings, recent transactions list, and quick action buttons. Role-based content shows different metrics for admins, pharmacists, and cashiers.

**Medicine Management:** Comprehensive medicine catalog interface with search/filter functionality, data table showing all medicines with sortable columns, add new medicine button, inline edit capabilities, delete with confirmation, and detailed view modal showing full medicine information including inventory levels across all batches.

**Inventory Management:** Batch-level inventory tracking interface displaying medicines with multiple batch entries. Shows batch number, expiry date, quantity, supplier, received date, and status (good, warning, critical based on expiry). Supports adding new batches, updating quantities, filtering by expiry status, and generating stock reports.

**Point of Sale (POS):** Fast, efficient transaction interface optimized for cashier workflow. Features include medicine search autocomplete, shopping cart with running total, customer lookup by phone, loyalty point display and redemption, discount application, payment method selection, invoice preview, and keyboard shortcuts for common actions.

**Prescription Management:** Prescription processing interface with upload functionality, OCR status indicators, side-by-side view of original image and extracted text, pharmacist verification controls, drug interaction warnings display, prescription status timeline, and link to dispense through POS.

**Customer Management:** Customer database with registration form, search/filter by name/phone, purchase history view, loyalty points balance, edit customer details, and customer analytics showing total spend, visit frequency, and favorite products.

**Suppliers Management:** Supplier directory with contact information, performance metrics (on-time delivery rate, order fulfillment rate), add/edit supplier forms, and list of purchase orders per supplier.

**Purchase Orders:** Procurement workflow interface showing pending orders, approved orders, received orders, and cancelled orders. Supports creating new purchase orders with multiple line items, supplier selection, expected delivery date, approval workflow, and marking orders as received to automatically update inventory.

**Reports:** Comprehensive reporting dashboard with date range selectors, report type selection (sales, inventory, profit/loss, customer analytics), chart visualizations, data tables with export options (PDF, Excel, CSV), and scheduled report functionality for automated daily/weekly/monthly reports.

**User Management:** Admin interface for managing system users. Shows user list with roles, add user form with role assignment, edit user permissions, deactivate/reactivate accounts, password reset functionality, and user activity logs.

**Notifications:** Centralized notification panel showing all system alerts. Categorized by type (low stock, expiry warnings, system notifications), filterable by read/unread status, mark as read functionality, notification details view, and settings for notification preferences.

**AI Scanner:** Dedicated interface for AI-powered prescription scanning. Features drag-and-drop image upload, immediate OCR processing with progress indicator, confidence score display for extracted text, manual correction tools, and direct submission for pharmacist review.

**AI Chatbot:** Interactive chatbot interface for customer and staff queries. Shows conversation history, message input field, quick action buttons for common queries (medicine availability, operating hours, prescription status), and AI-powered natural language understanding to provide relevant responses.

**Settings:** System configuration interface with sections for general settings (pharmacy name, contact info, operating hours), inventory settings (low stock threshold, expiry warning periods), loyalty program settings (points per currency unit, redemption rules), notification preferences, user profile management, and security settings (password change, two-factor authentication).

**Reference:** Detailed wireframes for all 15 screens are available in the [app/ui-mockups](../app/ui-mockups/) directory as interactive HTML files demonstrating navigation flow and responsive design across desktop, tablet, and mobile screen sizes.
