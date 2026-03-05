import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

export interface PrescriptionAttributes {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  patientAge?: number;
  patientPhone?: string;
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
  verifiedBy?: number;
  verifiedAt?: Date;
  status: 'pending' | 'verified' | 'dispensed' | 'rejected' | 'expired';
  notes?: string;
  aiWarnings?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrescriptionCreationAttributes extends Optional<PrescriptionAttributes, 'id' | 'patientAge' | 'patientPhone' | 'doctorLicense' | 'hospitalName' | 'validUntil' | 'imageUrl' | 'ocrText' | 'ocrConfidence' | 'verifiedBy' | 'verifiedAt' | 'notes' | 'aiWarnings' | 'status'> {}

class Prescription extends Model<PrescriptionAttributes, PrescriptionCreationAttributes> implements PrescriptionAttributes {
  public id!: number;
  public prescriptionNumber!: string;
  public patientName!: string;
  public patientAge?: number;
  public patientPhone?: string;
  public doctorName!: string;
  public doctorLicense?: string;
  public hospitalName?: string;
  public medications!: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
  public prescriptionDate!: Date;
  public validUntil?: Date;
  public imageUrl?: string;
  public ocrText?: string;
  public ocrConfidence?: number;
  public verifiedBy?: number;
  public verifiedAt?: Date;
  public status!: 'pending' | 'verified' | 'dispensed' | 'rejected' | 'expired';
  public notes?: string;
  public aiWarnings?: string[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      allowNull: true,
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
    indexes: [
      { fields: ['prescriptionNumber'] },
      { fields: ['patientName'] },
      { fields: ['status'] },
      { fields: ['prescriptionDate'] },
    ],
  }
);

// Associations
User.hasMany(Prescription, { foreignKey: 'verifiedBy', as: 'verifiedPrescriptions' });
Prescription.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

export default Prescription;
