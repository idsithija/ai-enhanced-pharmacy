import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface NotificationAttributes {
  id: number;
  userId: number;
  type: 'low_stock' | 'expiring_soon' | 'prescription_pending' | 'prescription_verified' | 'order_received' | 'system' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'isRead' | 'readAt' | 'actionUrl' | 'metadata' | 'priority'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public userId!: number;
  public type!: 'low_stock' | 'expiring_soon' | 'prescription_pending' | 'prescription_verified' | 'order_received' | 'system' | 'alert';
  public title!: string;
  public message!: string;
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public isRead!: boolean;
  public readAt?: Date;
  public actionUrl?: string;
  public metadata?: any;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('low_stock', 'expiring_soon', 'prescription_pending', 'prescription_verified', 'order_received', 'system', 'alert'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actionUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['is_read'] },
      { fields: ['priority'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Notification;
