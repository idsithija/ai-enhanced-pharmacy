import { User } from '../models/index.js';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const testPassword = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    const admin = await User.findOne({ where: { email: 'admin@pharmacy.com' } });
    
    if (admin) {
      console.log('Admin found:');
      console.log('Email:', admin.email);
      console.log('Password hash:', admin.password);
      console.log('Password starts with $2:', admin.password.startsWith('$2'));
      console.log();
      
      // Test password
      const testPass = 'admin123';
      console.log('Testing password:', testPass);
      
      const isValid = await admin.comparePassword(testPass);
      console.log('comparePassword result:', isValid);
      
      const directCompare = await bcrypt.compare(testPass, admin.password);
      console.log('Direct bcrypt.compare result:', directCompare);
    } else {
      console.log('Admin not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testPassword();
