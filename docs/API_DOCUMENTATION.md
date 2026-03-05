# 📚 API Documentation

## AI-Enhanced Pharmacy Management System - REST API

**Base URL:** `http://localhost:5000`  
**Version:** 1.0.0  
**Last Updated:** October 21, 2025

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Customer Management](#customer-management)
4. [Medicines](#medicines)
5. [Inventory](#inventory)
6. [Supplier Management](#supplier-management)
7. [Purchase Orders](#purchase-orders)
8. [Prescriptions](#prescriptions)
9. [Sales](#sales)
10. [Reports & Analytics](#reports--analytics)
11. [Notifications](#notifications)
12. [Dashboard](#dashboard)
13. [AI Services](#ai-services)
14. [Error Handling](#error-handling)
15. [Response Format](#response-format)

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Register User
**POST** `/api/auth/register`

Create a new user account.

**Access:** Public

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "cashier",
  "phoneNumber": "+1234567890"
}
```

**Fields:**
- `username` (required, string, 3-50 chars): Unique username
- `email` (required, string): Valid email address
- `password` (required, string, min 6 chars): User password
- `firstName` (required, string): First name
- `lastName` (required, string): Last name
- `role` (optional, enum): `admin`, `pharmacist`, `cashier`, `inventory_manager` (default: `cashier`)
- `phoneNumber` (optional, string): Contact number

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "cashier",
      "phoneNumber": "+1234567890"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login
**POST** `/api/auth/login`

Authenticate user and get JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "cashier",
      "phoneNumber": "+1234567890",
      "lastLogin": "2025-10-21T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User
**GET** `/api/auth/me`

Get the currently authenticated user's information.

**Access:** Private (requires authentication)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "cashier",
      "phoneNumber": "+1234567890",
      "lastLogin": "2025-10-21T10:30:00.000Z"
    }
  }
}
```

---

### Update Profile
**PUT** `/api/auth/profile`

Update the current user's profile information.

**Access:** Private

**Request Body:**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe Jr.",
  "phoneNumber": "+1987654321"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "Johnny",
      "lastName": "Doe Jr.",
      "role": "cashier",
      "phoneNumber": "+1987654321"
    }
  }
}
```

---

## � User Management

### Get All Users
**GET** `/api/users`

Retrieve all users in the system.

**Access:** Private (Admin only)

**Query Parameters:**
- `role` (optional, string): Filter by role (admin/pharmacist/cashier/inventory_manager)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@pharmacy.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "createdAt": "2025-10-20T10:00:00.000Z"
    }
  ]
}
```

---

### Create User
**POST** `/api/users`

Create a new user account (admin function).

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "username": "new_user",
  "email": "user@pharmacy.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "cashier",
  "phoneNumber": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "new_user",
    "email": "user@pharmacy.com",
    "role": "cashier"
  }
}
```

---

### Get User by ID
**GET** `/api/users/:id`

**Access:** Private (Admin only)

---

### Update User
**PUT** `/api/users/:id`

**Access:** Private (Admin only)

---

### Delete User
**DELETE** `/api/users/:id`

**Access:** Private (Admin only)

---

### Get User Statistics
**GET** `/api/users/stats`

Get statistics about users by role.

**Access:** Private (Admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 15,
    "byRole": {
      "admin": 2,
      "pharmacist": 5,
      "cashier": 6,
      "inventory_manager": 2
    },
    "activeUsers": 14
  }
}
```

---

## 👤 Customer Management

### Get All Customers
**GET** `/api/customers`

Retrieve all customers with optional filters.

**Access:** Private

**Query Parameters:**
- `search` (optional, string): Search by name, email, or phone
- `loyaltyTier` (optional, string): Filter by loyalty tier

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phoneNumber": "+1234567890",
      "address": "123 Main St",
      "dateOfBirth": "1990-05-15",
      "loyaltyPoints": 250,
      "totalPurchases": 1250.50,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### Create Customer
**POST** `/api/customers`

Add a new customer.

**Access:** Private

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "dateOfBirth": "1990-05-15"
}
```

---

### Get Customer by ID
**GET** `/api/customers/:id`

**Access:** Private

---

### Update Customer
**PUT** `/api/customers/:id`

**Access:** Private

---

### Delete Customer
**DELETE** `/api/customers/:id`

**Access:** Private (Admin only)

---

### Get Customer Statistics
**GET** `/api/customers/stats`

Get customer statistics.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 500,
    "newThisMonth": 45,
    "averageLoyaltyPoints": 180,
    "topCustomers": [
      {
        "id": 1,
        "name": "Jane Smith",
        "totalPurchases": 5000
      }
    ]
  }
}
```

---

### Find Customer by Phone
**GET** `/api/customers/phone/:phoneNumber`

Quick customer lookup by phone number.

**Access:** Private

---

### Update Loyalty Points
**PUT** `/api/customers/:id/loyalty`

Update customer loyalty points.

**Access:** Private

**Request Body:**
```json
{
  "points": 50,
  "operation": "add"
}
```

---

## �💊 Medicines

### Get All Medicines
**GET** `/api/medicines`

Retrieve a paginated list of medicines with optional filters.

**Access:** Private

**Query Parameters:**
- `search` (optional, string): Search by name, generic name, or brand name
- `category` (optional, string): Filter by category
- `requiresPrescription` (optional, boolean): Filter by prescription requirement
- `page` (optional, number, default: 1): Page number
- `limit` (optional, number, default: 20): Items per page

**Example Request:**
```
GET /api/medicines?search=aspirin&category=Pain Relief&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "id": 1,
        "name": "Aspirin 500mg",
        "genericName": "Acetylsalicylic Acid",
        "brandName": "Bayer Aspirin",
        "category": "Pain Relief",
        "dosageForm": "Tablet",
        "strength": "500mg",
        "manufacturer": "Bayer",
        "ndcCode": "0280-0280-10",
        "barcode": "123456789012",
        "description": "Pain reliever and fever reducer",
        "sideEffects": "Stomach upset, heartburn",
        "contraindications": "Bleeding disorders, aspirin allergy",
        "requiresPrescription": false,
        "isControlledSubstance": false,
        "storageConditions": "Store at room temperature",
        "activeIngredients": ["Acetylsalicylic Acid"],
        "isActive": true,
        "inventoryItems": [
          {
            "id": 1,
            "quantity": 500,
            "batchNumber": "BATCH001",
            "expiryDate": "2026-12-31"
          }
        ]
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 15
    }
  }
}
```

---

### Get Single Medicine
**GET** `/api/medicines/:id`

Get detailed information about a specific medicine.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "medicine": {
      "id": 1,
      "name": "Aspirin 500mg",
      "genericName": "Acetylsalicylic Acid",
      "brandName": "Bayer Aspirin",
      "category": "Pain Relief",
      "dosageForm": "Tablet",
      "strength": "500mg",
      "manufacturer": "Bayer",
      "inventoryItems": [...]
    }
  }
}
```

---

### Create Medicine
**POST** `/api/medicines`

Add a new medicine to the system.

**Access:** Private (admin, pharmacist only)

**Request Body:**
```json
{
  "name": "Ibuprofen 400mg",
  "genericName": "Ibuprofen",
  "brandName": "Advil",
  "category": "Pain Relief",
  "dosageForm": "Tablet",
  "strength": "400mg",
  "manufacturer": "Pfizer",
  "ndcCode": "0573-0573-01",
  "barcode": "987654321098",
  "description": "Nonsteroidal anti-inflammatory drug",
  "sideEffects": "Nausea, dizziness, stomach pain",
  "contraindications": "Heart disease, kidney problems",
  "requiresPrescription": false,
  "isControlledSubstance": false,
  "storageConditions": "Store in cool, dry place",
  "activeIngredients": ["Ibuprofen"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "medicine": { ... }
  }
}
```

---

### Update Medicine
**PUT** `/api/medicines/:id`

Update medicine information.

**Access:** Private (admin, pharmacist only)

**Request Body:** Same as Create Medicine (all fields optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "medicine": { ... }
  }
}
```

---

### Delete Medicine
**DELETE** `/api/medicines/:id`

Soft delete a medicine (marks as inactive).

**Access:** Private (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Medicine deleted successfully"
  }
}
```

---

## 📦 Inventory

### Get All Inventory
**GET** `/api/inventory`

Get inventory items with optional filters.

**Access:** Private

**Query Parameters:**
- `status` (optional, enum): `in_stock`, `low_stock`, `out_of_stock`, `expired`
- `medicineId` (optional, number): Filter by medicine ID
- `expiringSoon` (optional, boolean): Get items expiring in next 30 days
- `page` (optional, number, default: 1)
- `limit` (optional, number, default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "inventory": [
      {
        "id": 1,
        "medicineId": 1,
        "batchNumber": "BATCH001",
        "quantity": 500,
        "unitPrice": 5.50,
        "sellingPrice": 8.99,
        "manufacturingDate": "2025-01-15T00:00:00.000Z",
        "expiryDate": "2026-12-31T00:00:00.000Z",
        "supplierName": "MedSupply Inc.",
        "supplierBatchId": "SUP-2025-001",
        "reorderLevel": 50,
        "location": "Shelf A-12",
        "status": "in_stock",
        "medicine": {
          "id": 1,
          "name": "Aspirin 500mg",
          "genericName": "Acetylsalicylic Acid"
        }
      }
    ],
    "pagination": {
      "total": 85,
      "page": 1,
      "pages": 5
    }
  }
}
```

---

### Get Single Inventory Item
**GET** `/api/inventory/:id`

Get details of a specific inventory item.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "item": { ... }
  }
}
```

---

### Add Inventory Item
**POST** `/api/inventory`

Add new stock to inventory.

**Access:** Private (admin, inventory_manager only)

**Request Body:**
```json
{
  "medicineId": 1,
  "batchNumber": "BATCH002",
  "quantity": 1000,
  "unitPrice": 5.00,
  "sellingPrice": 8.50,
  "manufacturingDate": "2025-10-01",
  "expiryDate": "2027-09-30",
  "supplierName": "PharmaCorp",
  "supplierBatchId": "PC-2025-456",
  "reorderLevel": 100,
  "location": "Shelf B-05"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "item": { ... }
  }
}
```

---

### Update Inventory Item
**PUT** `/api/inventory/:id`

Update inventory item details.

**Access:** Private (admin, inventory_manager only)

**Request Body:** Same as Add Inventory (all fields optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "item": { ... }
  }
}
```

---

### Delete Inventory Item
**DELETE** `/api/inventory/:id`

Permanently delete an inventory item.

**Access:** Private (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Inventory item deleted successfully"
  }
}
```

---

### Get Low Stock Alerts
**GET** `/api/inventory/alerts/low-stock`

Get all items that are below reorder level.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 5,
        "quantity": 15,
        "reorderLevel": 50,
        "status": "low_stock",
        "medicine": {
          "name": "Amoxicillin 500mg"
        }
      }
    ],
    "count": 12
  }
}
```

---

## 📋 Prescriptions

### Get All Prescriptions
**GET** `/api/prescriptions`

Get prescriptions with optional filters.

**Access:** Private

**Query Parameters:**
- `status` (optional, enum): `pending`, `verified`, `dispensed`, `rejected`, `expired`
- `patientName` (optional, string): Search by patient name
- `page` (optional, number, default: 1)
- `limit` (optional, number, default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "prescriptions": [
      {
        "id": 1,
        "prescriptionNumber": "RX-2025-001",
        "patientName": "Jane Smith",
        "patientAge": 45,
        "patientPhone": "+1234567890",
        "doctorName": "Dr. Robert Johnson",
        "doctorLicense": "MD-12345",
        "hospitalName": "City General Hospital",
        "medications": [
          {
            "name": "Amoxicillin 500mg",
            "dosage": "500mg",
            "frequency": "3 times daily",
            "duration": "7 days",
            "quantity": 21
          }
        ],
        "prescriptionDate": "2025-10-20T00:00:00.000Z",
        "validUntil": "2025-11-20T00:00:00.000Z",
        "imageUrl": "/uploads/prescriptions/rx-2025-001.jpg",
        "ocrText": "Patient: Jane Smith...",
        "ocrConfidence": 95.5,
        "verifiedBy": 2,
        "verifiedAt": "2025-10-20T14:30:00.000Z",
        "status": "verified",
        "notes": "Patient has penicillin allergy - confirmed alternative",
        "aiWarnings": [
          "Check for drug interactions",
          "Verify dosage for patient age"
        ],
        "verifier": {
          "id": 2,
          "username": "pharmacist_mary",
          "firstName": "Mary",
          "lastName": "Wilson"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 3
    }
  }
}
```

---

### Get Single Prescription
**GET** `/api/prescriptions/:id`

Get detailed prescription information.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "prescription": { ... }
  }
}
```

---

### Create Prescription
**POST** `/api/prescriptions`

Create a new prescription record.

**Access:** Private (admin, pharmacist only)

**Request Body:**
```json
{
  "prescriptionNumber": "RX-2025-002",
  "patientName": "John Doe",
  "patientAge": 35,
  "patientPhone": "+1987654321",
  "doctorName": "Dr. Sarah Lee",
  "doctorLicense": "MD-67890",
  "hospitalName": "Metro Medical Center",
  "medications": [
    {
      "name": "Metformin 500mg",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "30 days",
      "quantity": 60
    }
  ],
  "prescriptionDate": "2025-10-21",
  "validUntil": "2025-12-21",
  "imageUrl": "/uploads/prescriptions/rx-2025-002.jpg",
  "ocrText": "Full OCR extracted text...",
  "ocrConfidence": 92.3,
  "notes": "Follow-up in 2 weeks"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "prescription": { ... }
  }
}
```

---

### Update Prescription
**PUT** `/api/prescriptions/:id`

Update prescription details.

**Access:** Private (admin, pharmacist only)

**Request Body:** Same as Create Prescription (all fields optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "prescription": { ... }
  }
}
```

---

### Verify Prescription
**PUT** `/api/prescriptions/:id/verify`

Mark prescription as verified by pharmacist.

**Access:** Private (admin, pharmacist only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "prescription": {
      "id": 1,
      "status": "verified",
      "verifiedBy": 2,
      "verifiedAt": "2025-10-21T15:45:00.000Z"
    }
  }
}
```

---

### Reject Prescription
**PUT** `/api/prescriptions/:id/reject`

Reject a prescription with reason.

**Access:** Private (admin, pharmacist only)

**Request Body:**
```json
{
  "notes": "Invalid doctor signature. Please resubmit."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "prescription": {
      "id": 1,
      "status": "rejected",
      "notes": "Invalid doctor signature. Please resubmit."
    }
  }
}
```

---

## 💰 Sales

### Get All Sales
**GET** `/api/sales`

Get sales records with optional filters.

**Access:** Private

**Query Parameters:**
- `startDate` (optional, date): Filter by start date
- `endDate` (optional, date): Filter by end date
- `cashierId` (optional, number): Filter by cashier
- `page` (optional, number, default: 1)
- `limit` (optional, number, default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sales": [
      {
        "id": 1,
        "invoiceNumber": "INV-1729512345-789",
        "cashierId": 1,
        "prescriptionId": 1,
        "customerName": "Jane Smith",
        "customerPhone": "+1234567890",
        "items": [
          {
            "medicineId": 1,
            "medicineName": "Amoxicillin 500mg",
            "batchNumber": "BATCH001",
            "quantity": 21,
            "unitPrice": 2.50,
            "discount": 0,
            "total": 52.50
          }
        ],
        "subtotal": 52.50,
        "discount": 5.00,
        "tax": 2.38,
        "totalAmount": 49.88,
        "paymentMethod": "card",
        "paymentStatus": "paid",
        "amountPaid": 50.00,
        "changeGiven": 0.12,
        "saleDate": "2025-10-21T16:30:00.000Z",
        "notes": "Customer requested receipt via email",
        "cashier": {
          "id": 1,
          "username": "john_doe",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": {
      "total": 234,
      "page": 1,
      "pages": 12
    }
  }
}
```

---

### Get Single Sale
**GET** `/api/sales/:id`

Get detailed sale information.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sale": { ... }
  }
}
```

---

### Create Sale
**POST** `/api/sales`

Process a new sale (POS transaction).

**Access:** Private (admin, cashier, pharmacist only)

**Request Body:**
```json
{
  "items": [
    {
      "medicineId": 1,
      "medicineName": "Aspirin 500mg",
      "batchNumber": "BATCH001",
      "quantity": 2,
      "unitPrice": 8.99,
      "discount": 0
    },
    {
      "medicineId": 5,
      "medicineName": "Vitamin C 1000mg",
      "batchNumber": "BATCH025",
      "quantity": 1,
      "unitPrice": 12.50,
      "discount": 1.00
    }
  ],
  "prescriptionId": null,
  "customerName": "Walk-in Customer",
  "customerPhone": null,
  "paymentMethod": "cash",
  "discount": 2.00,
  "notes": "Cash payment"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "sale": {
      "id": 100,
      "invoiceNumber": "INV-1729513456-123",
      "subtotal": 30.48,
      "discount": 2.00,
      "tax": 1.42,
      "totalAmount": 29.90,
      "paymentStatus": "paid",
      "saleDate": "2025-10-21T17:00:00.000Z"
    }
  }
}
```

**Note:** This endpoint automatically:
- Deducts inventory quantities
- Calculates tax (5%)
- Generates invoice number
- Updates prescription status if linked

---

### Get Sales Summary
**GET** `/api/sales/summary`

Get sales analytics and summary.

**Access:** Private

**Query Parameters:**
- `startDate` (optional, date): Summary start date
- `endDate` (optional, date): Summary end date

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalSales": 234,
    "totalRevenue": 45678.90,
    "totalDiscount": 1234.50
  }
}
```

---

## 📊 Dashboard

### Get Dashboard Statistics
**GET** `/api/dashboard/stats`

Get overview statistics for dashboard.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "todaySales": 45,
    "todayRevenue": 3456.78,
    "lowStockCount": 12,
    "expiringSoonCount": 8,
    "pendingPrescriptions": 5,
    "totalMedicines": 350,
    "totalUsers": 15
  }
}
```

---

### Get Recent Sales
**GET** `/api/dashboard/recent-sales`

Get 10 most recent sales transactions.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sales": [
      {
        "id": 100,
        "invoiceNumber": "INV-1729513456-123",
        "totalAmount": 29.90,
        "paymentMethod": "cash",
        "saleDate": "2025-10-21T17:00:00.000Z",
        "cashier": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

---

### Get Sales Chart Data
**GET** `/api/dashboard/sales-chart`

Get sales data for charting.

**Access:** Private

**Query Parameters:**
- `days` (optional, number, default: 7): Number of days to retrieve

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "salesData": [
      {
        "date": "2025-10-15",
        "count": 23,
        "revenue": 1234.56
      },
      {
        "date": "2025-10-16",
        "count": 34,
        "revenue": 2345.67
      }
    ]
  }
}
```

---

## 🤖 AI Services

### Process Prescription OCR
**POST** `/api/ai/ocr/prescription`

Extract text from prescription image using OCR.

**Access:** Private (admin, pharmacist only)

**Request Body:**
```json
{
  "imageUrl": "https://example.com/prescription.jpg"
}
```

**OR**

```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "text": "Full extracted text from prescription...",
    "confidence": 94.5,
    "extractedData": {
      "patientName": "Jane Smith",
      "doctorName": "Dr. Robert Johnson",
      "hospitalName": "City General Hospital",
      "medications": [
        {
          "name": "Amoxicillin 500mg Tab",
          "dosage": "500mg",
          "frequency": "3 times daily",
          "duration": "7 days"
        }
      ],
      "date": "10/20/2025"
    }
  }
}
```

---

### Check Drug Interactions
**POST** `/api/ai/drug-interactions`

Check for potential drug interactions.

**Access:** Private

**Request Body:**
```json
{
  "medications": [
    "Warfarin",
    "Aspirin",
    "Ibuprofen"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interactions": [
      {
        "severity": "major",
        "description": "Increased risk of bleeding when warfarin is combined with aspirin",
        "drugs": ["warfarin", "aspirin"]
      },
      {
        "severity": "moderate",
        "description": "Combining NSAIDs may increase risk of gastrointestinal bleeding",
        "drugs": ["aspirin", "ibuprofen"]
      }
    ]
  }
}
```

---

### Get Medication Information
**GET** `/api/ai/medication-info/:name`

Get detailed medication information from OpenFDA.

**Access:** Private

**Example Request:**
```
GET /api/ai/medication-info/Aspirin
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "name": "Aspirin",
    "genericName": "Acetylsalicylic Acid",
    "brandName": "Bayer Aspirin",
    "manufacturer": "Bayer Healthcare",
    "warnings": [
      "Reye's syndrome warning",
      "Allergy alert: Aspirin may cause severe allergic reaction"
    ],
    "indications": [
      "For temporary relief of minor aches and pains"
    ],
    "adverseReactions": [
      "Stomach bleeding",
      "Ringing in the ears"
    ],
    "dosageAndAdministration": "Adults: 1-2 tablets every 4-6 hours..."
  }
}
```

---

## 🏢 Supplier Management

### Get All Suppliers
**GET** `/api/suppliers`

Retrieve all suppliers.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "MedSupply Inc.",
      "contactPerson": "John Manager",
      "email": "contact@medsupply.com",
      "phoneNumber": "+1234567890",
      "address": "456 Supply St, City",
      "isActive": true,
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### Create Supplier
**POST** `/api/suppliers`

Add a new supplier.

**Access:** Private (Admin/Inventory Manager)

**Request Body:**
```json
{
  "name": "PharmaCorp",
  "contactPerson": "Jane Supplier",
  "email": "jane@pharmacorp.com",
  "phoneNumber": "+1987654321",
  "address": "789 Pharma Ave",
  "taxId": "TAX-123456"
}
```

---

### Get Supplier by ID
**GET** `/api/suppliers/:id`

**Access:** Private

---

### Update Supplier
**PUT** `/api/suppliers/:id`

**Access:** Private (Admin/Inventory Manager)

---

### Delete Supplier
**DELETE** `/api/suppliers/:id`

**Access:** Private (Admin only)

---

### Get Supplier Statistics
**GET** `/api/suppliers/stats`

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalSuppliers": 25,
    "activeSuppliers": 22,
    "topSuppliers": [
      {
        "id": 1,
        "name": "MedSupply Inc.",
        "totalOrders": 150,
        "totalAmount": 50000
      }
    ]
  }
}
```

---

## 📦 Purchase Orders

### Get All Purchase Orders
**GET** `/api/purchase-orders`

Retrieve all purchase orders with filtering.

**Access:** Private

**Query Parameters:**
- `status` (optional): Filter by status (pending/approved/received/cancelled)
- `supplierId` (optional): Filter by supplier

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNumber": "PO-2025-001",
      "supplierId": 1,
      "supplier": {
        "name": "MedSupply Inc."
      },
      "orderDate": "2025-10-15",
      "expectedDeliveryDate": "2025-10-25",
      "status": "approved",
      "totalAmount": 5000,
      "items": [
        {
          "medicineId": 1,
          "quantity": 100,
          "unitPrice": 50
        }
      ],
      "createdBy": 1,
      "createdAt": "2025-10-15T10:00:00.000Z"
    }
  ]
}
```

---

### Create Purchase Order
**POST** `/api/purchase-orders`

Create a new purchase order.

**Access:** Private (Admin/Inventory Manager)

**Request Body:**
```json
{
  "supplierId": 1,
  "expectedDeliveryDate": "2025-11-01",
  "items": [
    {
      "medicineId": 1,
      "quantity": 100,
      "unitPrice": 50
    }
  ],
  "notes": "Urgent order"
}
```

---

### Get Purchase Order by ID
**GET** `/api/purchase-orders/:id`

**Access:** Private

---

### Update Purchase Order
**PUT** `/api/purchase-orders/:id`

**Access:** Private (Admin/Inventory Manager)

---

### Delete Purchase Order
**DELETE** `/api/purchase-orders/:id`

**Access:** Private (Admin only)

---

### Approve Purchase Order
**PUT** `/api/purchase-orders/:id/approve`

Approve a pending purchase order.

**Access:** Private (Admin/Pharmacist)

---

### Receive Purchase Order
**PUT** `/api/purchase-orders/:id/receive`

Mark order as received and update inventory.

**Access:** Private (Inventory Manager/Admin)

**Request Body:**
```json
{
  "receivedItems": [
    {
      "medicineId": 1,
      "receivedQuantity": 100,
      "batchNumber": "BATCH-001",
      "expiryDate": "2026-12-31"
    }
  ]
}
```

---

### Cancel Purchase Order
**PUT** `/api/purchase-orders/:id/cancel`

Cancel a purchase order.

**Access:** Private (Admin)

---

## 📊 Reports & Analytics

### Sales Report
**GET** `/api/reports/sales`

Generate sales report with date range.

**Access:** Private

**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `groupBy` (optional): Group by day/week/month

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalSales": 50000,
    "totalTransactions": 250,
    "averageTransactionValue": 200,
    "salesByDate": [
      {
        "date": "2025-10-20",
        "sales": 2500,
        "transactions": 15
      }
    ],
    "topMedicines": [
      {
        "medicineId": 1,
        "name": "Aspirin",
        "quantitySold": 500,
        "revenue": 5000
      }
    ]
  }
}
```

---

### Inventory Report
**GET** `/api/reports/inventory`

Get current inventory status report.

**Access:** Private

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalItems": 500,
    "totalValue": 100000,
    "lowStockItems": 15,
    "expiringSoon": 8,
    "expired": 2,
    "byCategory": [
      {
        "category": "Antibiotics",
        "items": 50,
        "value": 15000
      }
    ]
  }
}
```

---

### Profit & Loss Report
**GET** `/api/reports/profit-loss`

Generate profit and loss statement.

**Access:** Private (Admin only)

**Query Parameters:**
- `startDate` (required)
- `endDate` (required)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "revenue": 50000,
    "costOfGoodsSold": 30000,
    "grossProfit": 20000,
    "expenses": 5000,
    "netProfit": 15000,
    "profitMargin": 30
  }
}
```

---

### Prescription Report
**GET** `/api/reports/prescriptions`

Get prescription statistics.

**Access:** Private

**Query Parameters:**
- `startDate`, `endDate`, `status`

---

### Top Medicines Report
**GET** `/api/reports/top-medicines`

Get best-selling medicines.

**Access:** Private

**Query Parameters:**
- `limit` (optional, default: 10)
- `startDate`, `endDate`

---

### Customer Purchase History
**GET** `/api/reports/customer-history/:customerId`

Get detailed purchase history for a customer.

**Access:** Private

---

## 🔔 Notifications

### Get User Notifications
**GET** `/api/notifications`

Get all notifications for the current user.

**Access:** Private

**Query Parameters:**
- `unreadOnly` (optional, boolean): Show only unread notifications

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "type": "low_stock",
      "title": "Low Stock Alert",
      "message": "Aspirin is running low (5 units remaining)",
      "isRead": false,
      "createdAt": "2025-10-21T10:00:00.000Z"
    }
  ]
}
```

---

### Mark Notification as Read
**PUT** `/api/notifications/:id/read`

Mark a single notification as read.

**Access:** Private

---

### Mark All as Read
**PUT** `/api/notifications/read-all`

Mark all notifications as read for current user.

**Access:** Private

---

### Delete Notification
**DELETE** `/api/notifications/:id`

Delete a notification.

**Access:** Private

---

### Create Notification
**POST** `/api/notifications`

Create a new notification (admin function).

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "userId": 1,
  "type": "system",
  "title": "System Update",
  "message": "System will be under maintenance tonight"
}
```

---

### Auto-Generate Notifications
**POST** `/api/notifications/generate`

Automatically generate notifications for low stock, expiring items, etc.

**Access:** Private (Admin/Inventory Manager)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "generated": 5,
    "types": {
      "low_stock": 3,
      "expiring_soon": 2
    }
  }
}
```

---

## ❌ Error Handling

All errors follow a consistent format:

**Response (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

### Common Error Codes:

- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Example Errors:

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "message": "No token provided"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Medicine not found"
  }
}
```

---

## 📝 Response Format

All successful responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Pagination

Paginated endpoints include pagination metadata:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 15
    }
  }
}
```

---

## 🔑 User Roles & Permissions

| Endpoint | Admin | Pharmacist | Cashier | Inventory Manager |
|----------|-------|------------|---------|-------------------|
| Auth (register, login) | ✅ | ✅ | ✅ | ✅ |
| View Medicines | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Medicines | ✅ | ✅ | ❌ | ❌ |
| Delete Medicines | ✅ | ❌ | ❌ | ❌ |
| View Inventory | ✅ | ✅ | ✅ | ✅ |
| Manage Inventory | ✅ | ❌ | ❌ | ✅ |
| View Prescriptions | ✅ | ✅ | ✅ | ✅ |
| Create/Verify Prescriptions | ✅ | ✅ | ❌ | ❌ |
| Create Sales | ✅ | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| OCR Processing | ✅ | ✅ | ❌ | ❌ |
| Drug Interactions | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Testing with cURL

### Register User:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User",
    "role": "cashier"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### Get Medicines (with auth):
```bash
curl -X GET http://localhost:5000/api/medicines \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Sale:
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "medicineId": 1,
        "medicineName": "Aspirin 500mg",
        "batchNumber": "BATCH001",
        "quantity": 2,
        "unitPrice": 8.99,
        "discount": 0
      }
    ],
    "paymentMethod": "cash"
  }'
```

---

## 📚 Additional Resources

- **Postman Collection**: Import and test all endpoints
- **Backend README**: See `backend/README.md` for setup instructions
- **Database Schema**: See `docs/DATABASE_SCHEMA_Version2.md`
- **System Architecture**: See `docs/SYSTEM_ARCHITECTURE_Version2.md`

---

## 📞 Support

For issues or questions:
- GitHub: https://github.com/idsithija/pharmacy
- Create an issue on the repository

---

**Last Updated:** October 21, 2025  
**API Version:** 1.0.0  
**Author:** @idsithija
