import sequelize from '../config/database.js';
import '../models/index.js';

/**
 * Database Migration - Sync all models with database
 * 
 * This script:
 * - Creates all tables if they don't exist
 * - Updates table schemas to match models
 * - Preserves existing data (alter: true)
 */

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized successfully');

    console.log('\n📊 Database Tables:');
    console.log('  - Users');
    console.log('  - Medicines');
    console.log('  - Inventory');
    console.log('  - Customers');
    console.log('  - Sales');
    console.log('  - SaleItems');
    console.log('  - Prescriptions');
    console.log('  - PrescriptionMedicines');
    console.log('  - Suppliers');
    console.log('  - PurchaseOrders');
    console.log('  - Notifications');

    console.log('\n✅ Migration complete!');
    console.log('💡 Run "npm run seed" to add sample data');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
