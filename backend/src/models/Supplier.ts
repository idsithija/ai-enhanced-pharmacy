import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface SupplierAttributes {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  licenseNumber?: string;
  paymentTerms?: string;
  creditLimit?: number;
  currentBalance?: number;
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierCreationAttributes extends Optional<SupplierAttributes, 'id' | 'alternatePhone' | 'taxId' | 'licenseNumber' | 'paymentTerms' | 'creditLimit' | 'currentBalance' | 'rating' | 'notes' | 'isActive'> {}

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
  public id!: number;
  public companyName!: string;
  public contactPerson!: string;
  public email!: string;
  public phoneNumber!: string;
  public alternatePhone?: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public country!: string;
  public taxId?: string;
  public licenseNumber?: string;
  public paymentTerms?: string;
  public creditLimit?: number;
  public currentBalance?: number;
  public rating?: number;
  public notes?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Supplier.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    alternatePhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Sri Lanka',
    },
    taxId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    licenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Net 30',
    },
    creditLimit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    currentBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'suppliers',
    indexes: [
      { fields: ['companyName'] },
      { fields: ['email'] },
      { fields: ['isActive'] },
    ],
  }
);

export default Supplier;
