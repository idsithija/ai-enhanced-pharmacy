import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'user';
  phoneNumber: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive' | 'lastLogin'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
  declare role: 'admin' | 'staff' | 'user';
  declare phoneNumber: string;
  declare isActive: boolean;
  declare lastLogin: Date | undefined;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Method to compare passwords
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Hook to hash password before saving
  public static async hashPassword(user: User): Promise<void> {
    if (user.changed('password') && user.password) {
      // Check if password is already hashed (bcrypt hashes start with $2)
      if (!user.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'user'),
      allowNull: false,
      defaultValue: 'user',
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    hooks: {
      beforeSave: User.hashPassword,
    },
  }
);

export default User;
