# Database Schema Design
## AI-Enhanced Pharmacy Management System - Node.js/Sequelize

**Version**: 1.0.0  
**Date**: October 20, 2025  
**Developer**: @idsithija  
**Database**: PostgreSQL 14+ with Sequelize ORM  
**Alternative**: MongoDB with Mongoose

---

## Table of Contents
1. [Database Overview](#database-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Sequelize Models](#sequelize-models)
4. [Table Definitions](#table-definitions)
5. [Relationships & Associations](#relationships--associations)
6. [Indexes & Performance](#indexes--performance)
7. [Sample Data](#sample-data)
8. [Database Queries](#database-queries)

---

## Database Overview

**Primary Database**: PostgreSQL 14+  
**ORM**: Sequelize v6  
**Naming Convention**: snake_case for database, camelCase for JavaScript  
**Migration Tool**: Sequelize CLI  

### Database Configuration

```javascript
// config/database.js

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'pharmacy_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
```

---

## Entity Relationship Diagram

```
┌─────────────────┐           ┌─────────────────┐
│     Users       │           │   Categories    │
├─────────────────┤           ├─────────────────┤
│ id (PK)         │           │ id (PK)         │
│ username        │           │ name            │
│ email           │           │ description     │
│ passwordHash    │           │ parentId (FK)   │
│ role            │           │ isActive        │
│ firstName       │           └────────┬────────┘
│ lastName        │                    │
│ phone           │                    │
│ isActive        │           ┌────────▼────────┐
└────────┬────────┘           │   Medicines     │
         │                    ├─────────────────┤
         │                    │ id (PK)         │
         │                    │ name            │
┌────────▼────────┐           │ genericName     │
│   Customers     │           │ categoryId (FK) │───────┐
├─────────────────┤           │ manufacturer    │       │
│ id (PK)         │           │ description     │       │
│ userId (FK)     │           │ dosageForm      │       │
│ phone           │           │ strength        │       │
│ address         │           │ unitPrice       │       │
│ dateOfBirth     │           │ mrp             │       │
│ bloodGroup      │           │ requiresRx      │       │
│ allergies       │           │ barcode         │       │
└────────┬────────┘           │ imageUrl        │       │
         │                    │ isActive        │       │
         │                    └────────┬────────┘       │
         │                             │                │
┌────────▼────────┐           ┌────────▼────────┐      │
│ Prescriptions   │           │   Inventory     │      │
├─────────────────┤           ├─────────────────┤      │
│ id (PK)         │           │ id (PK)         │      │
│ customerId (FK) │           │ medicineId (FK) │──────┘
│ doctorName      │           │ batchNumber     │
│ doctorReg       │           │ quantity        │
│ imageUrl        │           │ supplierId (FK) │
│ ocrText         │           │ mfgDate         │      ┌─────────────────┐
│ ocrConfidence   │           │ expiryDate      │      │   Suppliers     │
│ isVerified      │           │ unitCost        │      ├─────────────────┤
│ verifiedBy (FK) │           │ sellingPrice    │      │ id (PK)         │
└────────┬────────┘           │ location        │      │ name            │
         │                    │ reorderLevel    │──────│ contactPerson   │
         │                    └─────────────────┘      │ email           │
┌────────▼────────────┐                               │ phone           │
│ PrescriptionItems   │                               │ address         │
├─────────────────────┤                               │ isActive        │
│ id (PK)             │                               └─────────────────┘
│ prescriptionId (FK) │
│ medicineId (FK)     │
│ medicineName        │       ┌─────────────────┐
│ dosage              │       │     Sales       │
│ frequency           │       ├─────────────────┤
│ duration            │       │ id (PK)         │
│ quantity            │       │ invoiceNumber   │
│ instructions        │       │ customerId (FK) │
└─────────────────────┘       │ prescriptionId  │
                              │ userId (FK)     │
         ┌────────────────────│ subtotal        │
         │                    │ discount        │
         │                    │ tax             │
         │                    │ totalAmount     │
         │                    │ paymentMode     │
         │                    │ paymentStatus   │
         │                    └────────┬────────┘
         │                             │
         │                    ┌────────▼────────┐
         │                    │   SaleItems     │
         │                    ├─────────────────┤
         │                    │ id (PK)         │
         │                    │ saleId (FK)     │
         │                    │ medicineId (FK) │
         │                    │ batchNumber     │
         │                    │ quantity        │
         │                    │ unitPrice       │
         │                    │ discount        │
         │                    │ totalPrice      │
         │                    └─────────────────┘
         │
┌────────▼────────────────┐
│  DrugInteractions       │
├─────────────────────────┤
│ id (PK)                 │
│ drug1Id (FK)            │
│ drug2Id (FK)            │
│ severity                │
│ description             │
│ clinicalEffects         │
│ recommendation          │
│ source                  │
└─────────────────────────┘

         ┌─────────────────┐
         │  AuditLogs      │
         ├─────────────────┤
         │ id (PK)         │
         │ userId (FK)     │
         │ action          │
         │ tableName       │
         │ recordId        │
         │ oldValues       │
         │ newValues       │
         │ ipAddress       │
         │ userAgent       │
         └─────────────────┘
```

---

## Sequelize Models

### 1. User Model

```javascript
// models/User.js

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        len: [3, 50],
        isAlphanumeric: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    role: {
      type: DataTypes.ENUM('admin', 'pharmacist', 'customer'),
      allowNull: false,
      defaultValue: 'customer'
    },
    firstName: {
      type: DataTypes.STRING(50),
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(50),
      field: 'last_name'
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['role'] }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  };

  // Associations
  User.associate = (models) => {
    User.hasOne(models.Customer, {
      foreignKey: 'userId',
      as: 'customer'
    });
    User.hasMany(models.Sale, {
      foreignKey: 'userId',
      as: 'sales'
    });
    User.hasMany(models.AuditLog, {
      foreignKey: 'userId',
      as: 'auditLogs'
    });
  };

  return User;
};
```

### 2. Customer Model

```javascript
// models/Customer.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    address: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING(50)
    },
    state: {
      type: DataTypes.STRING(50)
    },
    zipCode: {
      type: DataTypes.STRING(10),
      field: 'zip_code'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      field: 'date_of_birth'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other')
    },
    bloodGroup: {
      type: DataTypes.STRING(5),
      field: 'blood_group'
    },
    allergies: {
      type: DataTypes.TEXT
    },
    medicalConditions: {
      type: DataTypes.TEXT,
      field: 'medical_conditions'
    },
    emergencyContact: {
      type: DataTypes.STRING(20),
      field: 'emergency_contact'
    }
  }, {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] }
    ]
  });

  Customer.associate = (models) => {
    Customer.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Customer.hasMany(models.Prescription, {
      foreignKey: 'customerId',
      as: 'prescriptions'
    });
    Customer.hasMany(models.Sale, {
      foreignKey: 'customerId',
      as: 'sales'
    });
  };

  return Customer;
};
```

### 3. Category Model

```javascript
// models/Category.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    parentCategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'categories',
        key: 'id'
      },
      field: 'parent_category_id'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['name'] }
    ]
  });

  Category.associate = (models) => {
    Category.hasMany(models.Medicine, {
      foreignKey: 'categoryId',
      as: 'medicines'
    });
    Category.belongsTo(Category, {
      foreignKey: 'parentCategoryId',
      as: 'parentCategory'
    });
    Category.hasMany(Category, {
      foreignKey: 'parentCategoryId',
      as: 'subcategories'
    });
  };

  return Category;
};
```

### 4. Medicine Model

```javascript
// models/Medicine.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Medicine = sequelize.define('Medicine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    genericName: {
      type: DataTypes.STRING(200),
      field: 'generic_name'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'categories',
        key: 'id'
      },
      field: 'category_id'
    },
    manufacturer: {
      type: DataTypes.STRING(200)
    },
    description: {
      type: DataTypes.TEXT
    },
    composition: {
      type: DataTypes.TEXT
    },
    dosageForm: {
      type: DataTypes.STRING(50),
      field: 'dosage_form',
      comment: 'tablet, capsule, syrup, injection, etc.'
    },
    strength: {
      type: DataTypes.STRING(50),
      comment: '500mg, 10ml, etc.'
    },
    packSize: {
      type: DataTypes.STRING(50),
      field: 'pack_size'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price'
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Maximum Retail Price'
    },
    requiresPrescription: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'requires_prescription'
    },
    barcode: {
      type: DataTypes.STRING(50),
      unique: true
    },
    sku: {
      type: DataTypes.STRING(50),
      unique: true
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      field: 'image_url'
    },
    sideEffects: {
      type: DataTypes.TEXT,
      field: 'side_effects'
    },
    usageInstructions: {
      type: DataTypes.TEXT,
      field: 'usage_instructions'
    },
    storageConditions: {
      type: DataTypes.TEXT,
      field: 'storage_conditions'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'medicines',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['generic_name'] },
      { fields: ['barcode'] },
      { fields: ['category_id'] }
    ]
  });

  Medicine.associate = (models) => {
    Medicine.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
    Medicine.hasMany(models.Inventory, {
      foreignKey: 'medicineId',
      as: 'inventory'
    });
    Medicine.hasMany(models.SaleItem, {
      foreignKey: 'medicineId',
      as: 'saleItems'
    });
    Medicine.hasMany(models.PrescriptionItem, {
      foreignKey: 'medicineId',
      as: 'prescriptionItems'
    });
  };

  return Medicine;
};
```

### 5. Supplier Model

```javascript
// models/Supplier.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Supplier = sequelize.define('Supplier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    contactPerson: {
      type: DataTypes.STRING(100),
      field: 'contact_person'
    },
    email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    address: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING(50)
    },
    state: {
      type: DataTypes.STRING(50)
    },
    zipCode: {
      type: DataTypes.STRING(10),
      field: 'zip_code'
    },
    gstin: {
      type: DataTypes.STRING(20),
      comment: 'GST Identification Number'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'suppliers',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['name'] }
    ]
  });

  Supplier.associate = (models) => {
    Supplier.hasMany(models.Inventory, {
      foreignKey: 'supplierId',
      as: 'inventory'
    });
  };

  return Supplier;
};
```

### 6. Inventory Model

```javascript
// models/Inventory.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    medicineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medicines',
        key: 'id'
      },
      field: 'medicine_id'
    },
    batchNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'batch_number'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    supplierId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'suppliers',
        key: 'id'
      },
      field: 'supplier_id'
    },
    manufactureDate: {
      type: DataTypes.DATEONLY,
      field: 'manufacture_date'
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'expiry_date'
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'unit_cost'
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'selling_price'
    },
    location: {
      type: DataTypes.STRING(100),
      comment: 'Shelf/rack location in store'
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      field: 'reorder_level'
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_available'
    }
  }, {
    tableName: 'inventory',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['medicine_id'] },
      { fields: ['expiry_date'] },
      { fields: ['batch_number'] },
      { 
        unique: true, 
        fields: ['medicine_id', 'batch_number'],
        name: 'unique_medicine_batch'
      }
    ]
  });

  Inventory.associate = (models) => {
    Inventory.belongsTo(models.Medicine, {
      foreignKey: 'medicineId',
      as: 'medicine'
    });
    Inventory.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplier'
    });
  };

  return Inventory;
};
```

### 7. Prescription Model

```javascript
// models/Prescription.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prescription = sequelize.define('Prescription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      },
      field: 'customer_id'
    },
    doctorName: {
      type: DataTypes.STRING(100),
      field: 'doctor_name'
    },
    doctorRegistration: {
      type: DataTypes.STRING(50),
      field: 'doctor_registration'
    },
    doctorPhone: {
      type: DataTypes.STRING(20),
      field: 'doctor_phone'
    },
    prescriptionDate: {
      type: DataTypes.DATEONLY,
      field: 'prescription_date'
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      field: 'image_url',
      comment: 'Scanned prescription image URL'
    },
    ocrRawText: {
      type: DataTypes.TEXT,
      field: 'ocr_raw_text',
      comment: 'Raw text extracted by OCR'
    },
    ocrConfidence: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'ocr_confidence',
      comment: 'OCR confidence score (0-100)'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    verifiedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'verified_by'
    },
    verifiedAt: {
      type: DataTypes.DATE,
      field: 'verified_at'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'prescriptions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['prescription_date'] }
    ]
  });

  Prescription.associate = (models) => {
    Prescription.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });
    Prescription.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifier'
    });
    Prescription.hasMany(models.PrescriptionItem, {
      foreignKey: 'prescriptionId',
      as: 'items'
    });
    Prescription.hasMany(models.Sale, {
      foreignKey: 'prescriptionId',
      as: 'sales'
    });
  };

  return Prescription;
};
```

### 8. PrescriptionItem Model

```javascript
// models/PrescriptionItem.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PrescriptionItem = sequelize.define('PrescriptionItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    prescriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'prescriptions',
        key: 'id'
      },
      field: 'prescription_id'
    },
    medicineId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'medicines',
        key: 'id'
      },
      field: 'medicine_id'
    },
    medicineName: {
      type: DataTypes.STRING(200),
      field: 'medicine_name',
      comment: 'As written in prescription'
    },
    dosage: {
      type: DataTypes.STRING(50),
      comment: '500mg, 10ml, etc.'
    },
    frequency: {
      type: DataTypes.STRING(50),
      comment: 'twice daily, every 8 hours, etc.'
    },
    duration: {
      type: DataTypes.STRING(50),
      comment: '7 days, 2 weeks, etc.'
    },
    quantity: {
      type: DataTypes.INTEGER
    },
    instructions: {
      type: DataTypes.TEXT,
      comment: 'Special instructions'
    },
    isDispensed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_dispensed'
    }
  }, {
    tableName: 'prescription_items',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['prescription_id'] },
      { fields: ['medicine_id'] }
    ]
  });

  PrescriptionItem.associate = (models) => {
    PrescriptionItem.belongsTo(models.Prescription, {
      foreignKey: 'prescriptionId',
      as: 'prescription'
    });
    PrescriptionItem.belongsTo(models.Medicine, {
      foreignKey: 'medicineId',
      as: 'medicine'
    });
  };

  return PrescriptionItem;
};
```

### 9. Sale Model

```javascript
// models/Sale.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sale = sequelize.define('Sale', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      field: 'invoice_number'
    },
    customerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'customers',
        key: 'id'
      },
      field: 'customer_id'
    },
    prescriptionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'prescriptions',
        key: 'id'
      },
      field: 'prescription_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id',
      comment: 'Pharmacist who made the sale'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    paymentMode: {
      type: DataTypes.ENUM('cash', 'card', 'upi', 'insurance'),
      allowNull: false,
      field: 'payment_mode'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'refunded'),
      defaultValue: 'completed',
      field: 'payment_status'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'sales',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['invoice_number'] },
      { fields: ['created_at'] }
    ],
    hooks: {
      beforeCreate: async (sale) => {
        // Auto-generate invoice number
        if (!sale.invoiceNumber) {
          const date = new Date();
          const timestamp = date.getTime();
          sale.invoiceNumber = `INV-${timestamp}`;
        }
      }
    }
  });

  Sale.associate = (models) => {
    Sale.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });
    Sale.belongsTo(models.Prescription, {
      foreignKey: 'prescriptionId',
      as: 'prescription'
    });
    Sale.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'pharmacist'
    });
    Sale.hasMany(models.SaleItem, {
      foreignKey: 'saleId',
      as: 'items'
    });
  };

  return Sale;
};
```

### 10. SaleItem Model

```javascript
// models/SaleItem.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SaleItem = sequelize.define('SaleItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sales',
        key: 'id'
      },
      field: 'sale_id'
    },
    medicineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medicines',
        key: 'id'
      },
      field: 'medicine_id'
    },
    batchNumber: {
      type: DataTypes.STRING(50),
      field: 'batch_number'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price'
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_price'
    }
  }, {
    tableName: 'sale_items',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['sale_id'] },
      { fields: ['medicine_id'] }
    ],
    hooks: {
      beforeSave: (saleItem) => {
        // Auto-calculate total price
        saleItem.totalPrice = (saleItem.unitPrice * saleItem.quantity) - saleItem.discount;
      }
    }
  });

  SaleItem.associate = (models) => {
    SaleItem.belongsTo(models.Sale, {
      foreignKey: 'saleId',
      as: 'sale'
    });
    SaleItem.belongsTo(models.Medicine, {
      foreignKey: 'medicineId',
      as: 'medicine'
    });
  };

  return SaleItem;
};
```

### 11. DrugInteraction Model

```javascript
// models/DrugInteraction.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DrugInteraction = sequelize.define('DrugInteraction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    drug1Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medicines',
        key: 'id'
      },
      field: 'drug1_id'
    },
    drug2Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medicines',
        key: 'id'
      },
      field: 'drug2_id'
    },
    severity: {
      type: DataTypes.ENUM('minor', 'moderate', 'major', 'critical'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    clinicalEffects: {
      type: DataTypes.TEXT,
      field: 'clinical_effects'
    },
    recommendation: {
      type: DataTypes.TEXT
    },
    source: {
      type: DataTypes.STRING(200),
      comment: 'Reference source (OpenFDA, medical database, etc.)'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'drug_interactions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['drug1_id'] },
      { fields: ['drug2_id'] },
      { 
        unique: true,
        fields: ['drug1_id', 'drug2_id'],
        name: 'unique_drug_pair'
      }
    ]
  });

  DrugInteraction.associate = (models) => {
    DrugInteraction.belongsTo(models.Medicine, {
      foreignKey: 'drug1Id',
      as: 'drug1'
    });
    DrugInteraction.belongsTo(models.Medicine, {
      foreignKey: 'drug2Id',
      as: 'drug2'
    });
  };

  return DrugInteraction;
};
```

### 12. AuditLog Model

```javascript
// models/AuditLog.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'CREATE, UPDATE, DELETE, LOGIN, etc.'
    },
    tableName: {
      type: DataTypes.STRING(50),
      field: 'table_name'
    },
    recordId: {
      type: DataTypes.INTEGER,
      field: 'record_id'
    },
    oldValues: {
      type: DataTypes.JSONB,
      field: 'old_values'
    },
    newValues: {
      type: DataTypes.JSONB,
      field: 'new_values'
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.TEXT,
      field: 'user_agent'
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Audit logs are never updated
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['created_at'] }
    ]
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return AuditLog;
};
```

### Index File (models/index.js)

```javascript
// models/index.js

const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const db = {};

// Import all models
db.User = require('./User')(sequelize);
db.Customer = require('./Customer')(sequelize);
db.Category = require('./Category')(sequelize);
db.Medicine = require('./Medicine')(sequelize);
db.Supplier = require('./Supplier')(sequelize);
db.Inventory = require('./Inventory')(sequelize);
db.Prescription = require('./Prescription')(sequelize);
db.PrescriptionItem = require('./PrescriptionItem')(sequelize);
db.Sale = require('./Sale')(sequelize);
db.SaleItem = require('./SaleItem')(sequelize);
db.DrugInteraction = require('./DrugInteraction')(sequelize);
db.AuditLog = require('./AuditLog')(sequelize);

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

---

## Sample Data (Seeders)

### User Seeder

```javascript
// database/seeders/20251020000001-users.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bcrypt = require('bcryptjs');
    
    return queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@pharmacy.com',
        password_hash: await bcrypt.hash('admin123', 10),
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        phone: '+1234567890',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'pharmacist1',
        email: 'pharmacist@pharmacy.com',
        password_hash: await bcrypt.hash('pharma123', 10),
        role: 'pharmacist',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567891',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'customer1',
        email: 'customer@example.com',
        password_hash: await bcrypt.hash('customer123', 10),
        role: 'customer',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1234567892',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
```

---

## Common Database Queries

### Get all medicines with inventory

```javascript
const medicines = await Medicine.findAll({
  include: [
    {
      model: Category,
      as: 'category'
    },
    {
      model: Inventory,
      as: 'inventory',
      where: {
        expiryDate: {
          [Op.gt]: new Date()
        }
      },
      required: false
    }
  ]
});
```

### Get low stock medicines

```javascript
const { Op, Sequelize } = require('sequelize');

const lowStockMedicines = await Medicine.findAll({
  attributes: [
    'id',
    'name',
    [Sequelize.fn('SUM', Sequelize.col('inventory.quantity')), 'totalStock']
  ],
  include: [{
    model: Inventory,
    as: 'inventory',
    attributes: [],
    where: {
      expiryDate: {
        [Op.gt]: new Date()
      }
    }
  }],
  group: ['Medicine.id'],
  having: Sequelize.where(
    Sequelize.fn('SUM', Sequelize.col('inventory.quantity')),
    { [Op.lt]: 10 }
  )
});
```

### Create sale with items (Transaction)

```javascript
const { sequelize } = require('./models');

async function createSale(saleData, items) {
  const t = await sequelize.transaction();
  
  try {
    // Create sale
    const sale = await Sale.create(saleData, { transaction: t });
    
    // Create sale items
    for (const item of items) {
      await SaleItem.create({
        ...item,
        saleId: sale.id
      }, { transaction: t });
      
      // Update inventory
      const inventory = await Inventory.findOne({
        where: {
          medicineId: item.medicineId,
          batchNumber: item.batchNumber
        },
        transaction: t
      });
      
      await inventory.decrement('quantity', {
        by: item.quantity,
        transaction: t
      });
    }
    
    await t.commit();
    return sale;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
```

---

*Document Complete*  
*Last Updated: October 20, 2025*  
*Author: @idsithija*