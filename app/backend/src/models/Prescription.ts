import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

export interface PrescriptionAttributes {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  patientAge?: number;
  patientPhone: string;
  doctorName: string;
  doctorLicense?: string;
  hospitalName?: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
  prescriptionDate: Date;
  validUntil?: Date;
  imageUrl?: string;
  ocrText?: string;
  ocrConfidence?: number;
  createdBy?: number;
  verifiedBy?: number;
  verifiedAt?: Date;
  status: 'pending' | 'verified' | 'dispensed' | 'rejected' | 'expired';
  notes?: string;
  aiWarnings?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrescriptionCreationAttributes extends Optional<PrescriptionAttributes, 'id' | 'patientAge' | 'doctorLicense' | 'hospitalName' | 'validUntil' | 'imageUrl' | 'ocrText' | 'ocrConfidence' | 'createdBy' | 'verifiedBy' | 'verifiedAt' | 'notes' | 'aiWarnings' | 'status'> {}

class Prescription extends Model<PrescriptionAttributes, PrescriptionCreationAttributes> implements PrescriptionAttributes {
  declare id: number;
  declare prescriptionNumber: string;
  declare patientName: string;
  declare patientAge: number | undefined;
  declare patientPhone: string;
  declare doctorName: string;
  declare doctorLicense: string | undefined;
  declare hospitalName: string | undefined;
  declare medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
  declare prescriptionDate: Date;
  declare validUntil: Date | undefined;
  declare imageUrl: string | undefined;
  declare ocrText: string | undefined;
  declare ocrConfidence: number | undefined;
  declare createdBy: number | undefined;
  declare verifiedBy: number | undefined;
  declare verifiedAt: Date | undefined;
  declare status: 'pending' | 'verified' | 'dispensed' | 'rejected' | 'expired';
  declare notes: string | undefined;
  declare aiWarnings: string[] | undefined;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Prescription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    prescriptionNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    patientName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    patientAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 150,
      },
    },
    patientPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    doctorName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    doctorLicense: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    hospitalName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    medications: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    prescriptionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    ocrText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ocrConfidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    verifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'dispensed', 'rejected', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    aiWarnings: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'prescriptions',
    underscored: true,
    indexes: [
      { fields: ['prescription_number'] },
      { fields: ['patient_name'] },
      { fields: ['created_by'] },
      { fields: ['status'] },
      { fields: ['prescription_date'] },
    ],
  }
);

export default Prescription;
