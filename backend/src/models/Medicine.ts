import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface MedicineAttributes {
  id: number;
  name: string;
  genericName: string;
  brandName?: string;
  category: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  ndcCode?: string;
  barcode?: string;
  description?: string;
  sideEffects?: string;
  contraindications?: string;
  requiresPrescription: boolean;
  isControlledSubstance: boolean;
  storageConditions?: string;
  activeIngredients?: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicineCreationAttributes extends Optional<MedicineAttributes, 'id' | 'brandName' | 'ndcCode' | 'barcode' | 'description' | 'sideEffects' | 'contraindications' | 'storageConditions' | 'activeIngredients' | 'isActive'> {}

class Medicine extends Model<MedicineAttributes, MedicineCreationAttributes> implements MedicineAttributes {
  public id!: number;
  public name!: string;
  public genericName!: string;
  public brandName?: string;
  public category!: string;
  public dosageForm!: string;
  public strength!: string;
  public manufacturer!: string;
  public ndcCode?: string;
  public barcode?: string;
  public description?: string;
  public sideEffects?: string;
  public contraindications?: string;
  public requiresPrescription!: boolean;
  public isControlledSubstance!: boolean;
  public storageConditions?: string;
  public activeIngredients?: string[];
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Medicine.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    genericName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    brandName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dosageForm: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    strength: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    manufacturer: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    ndcCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    barcode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sideEffects: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contraindications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requiresPrescription: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isControlledSubstance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    storageConditions: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    activeIngredients: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'medicines',
    indexes: [
      { fields: ['name'] },
      { fields: ['genericName'] },
      { fields: ['category'] },
      { fields: ['ndcCode'] },
      { fields: ['barcode'] },
    ],
  }
);

export default Medicine;
