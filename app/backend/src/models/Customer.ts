import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface CustomerAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  loyaltyPoints?: number;
  totalPurchases?: number;
  lastVisit?: Date;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'id' | 'email' | 'address' | 'city' | 'state' | 'zipCode' | 'dateOfBirth' | 'gender' | 'allergies' | 'medicalConditions' | 'emergencyContact' | 'emergencyPhone' | 'loyaltyPoints' | 'totalPurchases' | 'lastVisit' | 'notes' | 'isActive'> {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email?: string;
  public phoneNumber!: string;
  public address?: string;
  public city?: string;
  public state?: string;
  public zipCode?: string;
  public dateOfBirth?: Date;
  public gender?: 'male' | 'female' | 'other';
  public allergies?: string[];
  public medicalConditions?: string[];
  public emergencyContact?: string;
  public emergencyPhone?: string;
  public loyaltyPoints?: number;
  public totalPurchases?: number;
  public lastVisit?: Date;
  public notes?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    allergies: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    medicalConditions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    emergencyContact: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergencyPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    totalPurchases: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    lastVisit: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'customers',
    indexes: [
      { fields: ['phoneNumber'] },
      { fields: ['email'] },
      { fields: ['firstName', 'lastName'] },
    ],
  }
);

export default Customer;
