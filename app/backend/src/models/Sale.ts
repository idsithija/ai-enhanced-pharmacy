import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Prescription from './Prescription.js';

export interface SaleAttributes {
  id: number;
  invoiceNumber: string;
  cashierId: number;
  prescriptionId?: number;
  customerName?: string;
  customerPhone?: string;
  items: {
    medicineId: number;
    medicineName: string;
    batchNumber: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance';
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded';
  amountPaid?: number;
  changeGiven?: number;
  saleDate: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleCreationAttributes extends Optional<SaleAttributes, 'id' | 'prescriptionId' | 'customerName' | 'customerPhone' | 'discount' | 'tax' | 'amountPaid' | 'changeGiven' | 'notes'> {}

class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: number;
  public invoiceNumber!: string;
  public cashierId!: number;
  public prescriptionId?: number;
  public customerName?: string;
  public customerPhone?: string;
  public items!: {
    medicineId: number;
    medicineName: string;
    batchNumber: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }[];
  public subtotal!: number;
  public discount!: number;
  public tax!: number;
  public totalAmount!: number;
  public paymentMethod!: 'cash' | 'card' | 'upi' | 'insurance';
  public paymentStatus!: 'paid' | 'pending' | 'partial' | 'refunded';
  public amountPaid?: number;
  public changeGiven?: number;
  public saleDate!: Date;
  public notes?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    cashierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    prescriptionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Prescription,
        key: 'id',
      },
    },
    customerName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
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
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'upi', 'insurance'),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('paid', 'pending', 'partial', 'refunded'),
      allowNull: false,
      defaultValue: 'paid',
    },
    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    changeGiven: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    saleDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'sales',
    underscored: true,
    indexes: [
      { fields: ['invoice_number'] },
      { fields: ['cashier_id'] },
      { fields: ['prescription_id'] },
      { fields: ['sale_date'] },
      { fields: ['payment_status'] },
    ],
  }
);

export default Sale;
