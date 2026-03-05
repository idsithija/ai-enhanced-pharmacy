import { User } from '../models/index.js';
import sequelize from '../config/database.js';

const checkAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const admin = await User.findOne({ where: { email: 'admin@pharmacy.com' } });
    
    if (admin) {
      console.log('Admin account found:');
      console.log('Email:', admin.email);
      console.log('Username:', admin.username);
      console.log('Is Active:', admin.isActive);
      console.log('Role:', admin.role);
    } else {
      console.log('Admin account not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin:', error);
    process.exit(1);
  }
};

checkAdmin();
