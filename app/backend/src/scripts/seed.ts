import { connectDatabase } from '../config/database.js';
import { seedDatabase } from '../utils/seed.js';
import dotenv from 'dotenv';

dotenv.config();

const runSeed = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    
    console.log('🌱 Seeding database...');
    await seedDatabase();
    
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

runSeed();
