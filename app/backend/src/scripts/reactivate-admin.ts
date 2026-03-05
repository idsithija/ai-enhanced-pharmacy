import { User } from '../models/index.js';
import sequelize from '../config/database.js';

const reactivateAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const result = await User.update(
      { isActive: true },
      { where: { email: 'admin@pharmacy.com' } }
    );

    console.log('✅ Admin account reactivated successfully');
    console.log(`Updated ${result[0]} record(s)`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error reactivating admin:', error);
    process.exit(1);
  }
};

reactivateAdmin();
