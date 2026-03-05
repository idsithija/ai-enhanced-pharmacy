# 🏥 Pharmacy Management System - Complete API Reference

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 API Endpoints

### **Authentication** `/api/auth`

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "cashier",
  "phoneNumber": "9876543210"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "cashier",
      "phoneNumber": "9876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@pharmacy.com",
  "password": "admin123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer TOKEN

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@pharmacy.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

---

### **Medicines** `/api/medicines`

#### Get All Medicines
```http
GET /api/medicines?page=1&limit=10&search=paracetamol

Response: 200 OK
{
  "success": true,
  "data": {
    "medicines": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

#### Get Single Medicine
```http
GET /api/medicines/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Paracetamol 500mg",
    "genericName": "Acetaminophen",
    "category": "Analgesic",
    ...
  }
}
```

#### Create Medicine (Protected)
```http
POST /api/medicines
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Aspirin 75mg",
  "genericName": "Acetylsalicylic Acid",
  "category": "Antiplatelet",
  "dosageForm": "Tablet",
  "strength": "75mg",
  "manufacturer": "Bayer",
  "requiresPrescription": false,
  "isControlledSubstance": false
}
```

#### Update Medicine (Protected)
```http
PUT /api/medicines/:id
Authorization: Bearer TOKEN

{
  "name": "Updated Name",
  "category": "New Category"
}
```

#### Delete Medicine (Protected)
```http
DELETE /api/medicines/:id
Authorization: Bearer TOKEN

Response: 200 OK
{
  "success": true,
  "message": "Medicine deleted successfully"
}
```

---

### **Inventory** `/api/inventory`

#### Get Inventory
```http
GET /api/inventory?page=1&limit=10

Response: 200 OK
{
  "success": true,
  "data": {
    "inventory": [
      {
        "id": 1,
        "medicineId": 1,
        "batchNumber": "BATCH001",
        "quantity": 150,
        "expiryDate": "2025-12-31",
        "costPrice": 5.50,
        "sellingPrice": 10.00,
        "medicine": { ... }
      }
    ]
  }
}
```

#### Add Stock (Protected)
```http
POST /api/inventory
Authorization: Bearer TOKEN

{
  "medicineId": 1,
  "batchNumber": "BATCH002",
  "quantity": 200,
  "minQuantity": 20,
  "expiryDate": "2025-12-31",
  "costPrice": 5.00,
  "sellingPrice": 10.00,
  "supplierId": 1
}
```

#### Get Low Stock Items
```http
GET /api/inventory/low-stock

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 3,
      "quantity": 15,
      "minQuantity": 50,
      "medicine": { ... }
    }
  ]
}
```

#### Get Expiring Items
```http
GET /api/inventory/expiring?days=30

Response: Items expiring within 30 days
```

---

### **Sales** `/api/sales`

#### Create Sale (POS)
```http
POST /api/sales
Authorization: Bearer TOKEN

{
  "customerId": 1,
  "items": [
    {
      "medicineId": 1,
      "inventoryId": 1,
      "quantity": 2,
      "unitPrice": 10.00
    }
  ],
  "paymentMethod": "cash",
  "discount": 5
}

Response: 201 Created
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "id": 1,
    "invoiceNumber": "INV-2024-001",
    "subtotal": 20.00,
    "discount": 1.00,
    "tax": 0.95,
    "total": 19.95
  }
}
```

#### Get Sales
```http
GET /api/sales?page=1&limit=10&startDate=2024-01-01&endDate=2024-12-31
```

#### Get Sales Summary
```http
GET /api/sales/summary?startDate=2024-01-01&endDate=2024-12-31

Response: 200 OK
{
  "success": true,
  "data": {
    "totalSales": 150000,
    "totalTransactions": 450,
    "averageOrderValue": 333.33
  }
}
```

---

### **Customers** `/api/customers`

#### Get All Customers
```http
GET /api/customers?page=1&limit=10&search=john
```

#### Find Customer by Phone
```http
GET /api/customers/phone/9876543210

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "loyaltyPoints": 450
  }
}
```

#### Create Customer
```http
POST /api/customers

{
  "name": "Jane Smith",
  "phone": "9876543211",
  "email": "jane@example.com",
  "address": "123 Main St",
  "dateOfBirth": "1990-05-15"
}
```

#### Add Loyalty Points
```http
POST /api/customers/:id/loyalty/add

{
  "points": 50
}
```

---

### **Prescriptions** `/api/prescriptions`

#### Create Prescription
```http
POST /api/prescriptions
Authorization: Bearer TOKEN

{
  "customerId": 1,
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "doctorName": "Dr. Sarah Smith",
  "doctorLicense": "MED12345",
  "medicines": [
    {
      "medicineId": 2,
      "medicineName": "Amoxicillin 250mg",
      "dosage": "250mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "quantity": 21
    }
  ],
  "notes": "Patient has mild allergies"
}
```

#### Verify Prescription (Pharmacist)
```http
POST /api/prescriptions/:id/verify
Authorization: Bearer TOKEN

{
  "verificationNotes": "Prescription verified and approved"
}
```

#### Dispense Prescription (Pharmacist)
```http
POST /api/prescriptions/:id/dispense
Authorization: Bearer TOKEN

{
  "dispensedNotes": "Medicines dispensed, patient counseled"
}
```

---

### **Reports** `/api/reports`

#### Sales Report
```http
GET /api/reports/sales?startDate=2024-01-01&endDate=2024-12-31

Response: 200 OK
{
  "success": true,
  "data": {
    "totalSales": 500000,
    "totalTransactions": 1250,
    "averageOrderValue": 400,
    "topSellingMedicines": [...]
  }
}
```

#### Inventory Report
```http
GET /api/reports/inventory

Response: Inventory statistics and breakdown
```

#### Customer Report
```http
GET /api/reports/customers?startDate=2024-01-01&endDate=2024-12-31

Response: Customer analytics
```

#### Financial Report
```http
GET /api/reports/financial?startDate=2024-01-01&endDate=2024-12-31

Response: Revenue, expenses, profit data
```

---

### **Dashboard** `/api/dashboard`

#### Get Dashboard Stats
```http
GET /api/dashboard/stats

Response: 200 OK
{
  "success": true,
  "data": {
    "todaySales": 8500,
    "todayTransactions": 45,
    "lowStockCount": 12,
    "expiringItemsCount": 8
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": [...]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Internal server error"
  }
}
```

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- Headers returned:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1234567890

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Search & Filtering

**Search:**
- `?search=keyword` - Search by name, email, phone, etc.

**Filtering:**
- `?status=active` - Filter by status
- `?category=Analgesic` - Filter by category
- `?startDate=2024-01-01&endDate=2024-12-31` - Date range

---

## File Uploads

**Upload Prescription Image:**
```http
POST /api/prescriptions/upload
Content-Type: multipart/form-data
Authorization: Bearer TOKEN

FormData:
- image: <file>

Response: 200 OK
{
  "success": true,
  "data": {
    "url": "/uploads/prescriptions/image-123456.jpg"
  }
}
```

**Supported Formats:** JPG, PNG, PDF
**Max Size:** 10MB

---

## Webhooks & Notifications

Coming soon - real-time notifications for:
- Low stock alerts
- Expiring items
- New prescriptions
- New orders

---

## SDK & Libraries

- JavaScript/TypeScript SDK (coming soon)
- Python Client (coming soon)

---

## Support

For issues or questions:
- GitHub: https://github.com/idsithija/pharmacy
- Email: support@pharmacy.com
