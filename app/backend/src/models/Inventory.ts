import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Medicine from './Medicine.js';

export interface InventoryAttributes {
  id: number;
  medicineId: number;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  sellingPrice: number;
  manufacturingDate: Date;
  expiryDate: Date;
  supplierName?: string;
  supplierBatchId?: string;
  reorderLevel: number;
  location?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InventoryCreationAttributes extends Optional<InventoryAttributes, 'id' | 'supplierName' | 'supplierBatchId' | 'location' | 'status'> {}

class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
  public id!: number;
  public medicineId!: number;
  public batchNumber!: string;
  public quantity!: number;
  public unitPrice!: number;
  public sellingPrice!: number;
  public manufacturingDate!: Date;
  public expiryDate!: Date;
  public supplierName?: string;
  public supplierBatchId?: string;
  public reorderLevel!: number;
  public location?: string;
  public status!: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to update status based on quantity and expiry
  public updateStatus(): void {
    const now = new Date();
    if (this.expiryDate < now) {
      this.status = 'expired';
    } else if (this.quantity === 0) {
      this.status = 'out_of_stock';
    } else if (this.quantity <= this.reorderLevel) {
      this.status = 'low_stock';
    } else {
      this.status = 'in_stock';
    }
  }
}

Inventory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    medicineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Medicine,
        key: 'id',
      },
    },
    batchNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    manufacturingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    supplierName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    supplierBatchId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('in_stock', 'low_stock', 'out_of_stock', 'expired'),
      allowNull: false,
      defaultValue: 'in_stock',
    },
  },
  {
    sequelize,
    tableName: 'inventory',
    underscored: true,
    hooks: {
      beforeSave: (inventory: Inventory) => {
        inventory.updateStatus();
      },
    },
    indexes: [
      { fields: ['medicine_id'] },
      { fields: ['batch_number'] },
      { fields: ['status'] },
      { fields: ['expiry_date'] },
    ],
  }
);

export default Inventory;
