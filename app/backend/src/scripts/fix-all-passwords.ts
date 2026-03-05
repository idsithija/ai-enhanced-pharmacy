import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const fixAllPasswords = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    const users = [
      { email: 'admin@pharmacy.com', password: 'admin123' },
      { email: 'pharmacist@pharmacy.com', password: 'pharmacist123' },
      { email: 'cashier@pharmacy.com', password: 'cashier123' }
    ];

    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      await sequelize.query(
        'UPDATE users SET password = :password WHERE email = :email',
        {
          replacements: { password: hashedPassword, email: user.email }
        }
      );
      
      console.log(`✅ ${user.email} password hashed`);
    }
    
    console.log('\n✅ All passwords updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAllPasswords();
