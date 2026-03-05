import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface PurchaseOrderAttributes {
  id: number;
  orderNumber: string;
  supplierId: number;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  paymentMethod?: string;
  notes?: string;
  createdBy: number;
  approvedBy?: number;
  receivedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseOrderItem {
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
  expiryDate?: Date;
  receivedQuantity?: number;
}

export interface PurchaseOrderCreationAttributes extends Optional<PurchaseOrderAttributes, 'id' | 'expectedDeliveryDate' | 'actualDeliveryDate' | 'status' | 'paymentStatus' | 'paidAmount' | 'paymentMethod' | 'notes' | 'approvedBy' | 'receivedBy'> {}

class PurchaseOrder extends Model<PurchaseOrderAttributes, PurchaseOrderCreationAttributes> implements PurchaseOrderAttributes {
  public id!: number;
  public orderNumber!: string;
  public supplierId!: number;
  public orderDate!: Date;
  public expectedDeliveryDate?: Date;
  public actualDeliveryDate?: Date;
  public status!: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  public items!: PurchaseOrderItem[];
  public subtotal!: number;
  public tax!: number;
  public shippingCost!: number;
  public discount!: number;
  public totalAmount!: number;
  public paymentStatus!: 'unpaid' | 'partial' | 'paid';
  public paidAmount!: number;
  public paymentMethod?: string;
  public notes?: string;
  public createdBy!: number;
  public approvedBy?: number;
  public receivedBy?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PurchaseOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'suppliers',
        key: 'id',
      },
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actualDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
      allowNull: false,
      defaultValue: 'unpaid',
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    receivedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'purchase_orders',
    indexes: [
      { fields: ['orderNumber'] },
      { fields: ['supplierId'] },
      { fields: ['status'] },
      { fields: ['orderDate'] },
      { fields: ['createdBy'] },
    ],
  }
);

export default PurchaseOrder;
