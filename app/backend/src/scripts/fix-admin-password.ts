import { User } from '../models/index.js';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const fixAdminPassword = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    const admin = await User.findOne({ where: { email: 'admin@pharmacy.com' } });
    
    if (admin) {
      console.log('Current password:', admin.password);
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update using raw SQL to bypass hooks
      await sequelize.query(
        'UPDATE users SET password = :password WHERE email = :email',
        {
          replacements: { password: hashedPassword, email: 'admin@pharmacy.com' }
        }
      );
      
      console.log('✅ Password updated and hashed');
      console.log('New password hash:', hashedPassword);
      
      // Verify
      const updated = await User.findOne({ where: { email: 'admin@pharmacy.com' } });
      if (updated) {
        const isValid = await bcrypt.compare('admin123', updated.password);
        console.log('Verification - password works:', isValid);
      }
    } else {
      console.log('Admin not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAdminPassword();
