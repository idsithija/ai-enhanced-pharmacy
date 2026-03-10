import { Client } from 'pg';
import { connectDatabase } from '../config/database.js';
import sequelize from '../config/database.js';
import { User, Medicine, Inventory, Customer, Supplier, Prescription, Sale, PurchaseOrder, Notification } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Helper to safely extract ID from Sequelize model instance
const getId = (instance: any): number => instance.get?.('id') ?? instance.dataValues?.id ?? instance.id;

async function ensureDatabaseExists() {
  const dbName = process.env.DB_NAME || 'pharmacy_db';
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456789',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created.`);
    } else {
      console.log(`ℹ️  Database "${dbName}" already exists.`);
    }
  } finally {
    await client.end();
  }
}

const seed = async () => {
  try {
    console.log('🔌 Ensuring database exists...');
    await ensureDatabaseExists();

    console.log('🔌 Connecting to database...');
    await connectDatabase();

    // Sync all models (create/update tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized.');

    console.log('🌱 Starting database seeding...\n');

    // ============================================
    // USERS
    // ============================================
    console.log('👥 Creating users...');

    const users = [
      { username: 'admin', email: 'admin@pharmacy.com', password: 'admin123', firstName: 'Admin', lastName: 'Manager', role: 'admin', phoneNumber: '0771234001', isActive: true },
      { username: 'pharmacist', email: 'pharmacist@pharmacy.com', password: 'pharmacist123', firstName: 'Dr. Sarah', lastName: 'Johnson', role: 'staff', phoneNumber: '0771234002', isActive: true },
      { username: 'staff2', email: 'staff2@pharmacy.com', password: 'staff123', firstName: 'Nimal', lastName: 'Perera', role: 'staff', phoneNumber: '0771234003', isActive: true },
      { username: 'user1', email: 'user@pharmacy.com', password: 'user123', firstName: 'Emily', lastName: 'Davis', role: 'user', phoneNumber: '0771234004', isActive: true },
      { username: 'user2', email: 'user2@pharmacy.com', password: 'user123', firstName: 'Kamal', lastName: 'Fernando', role: 'user', phoneNumber: '0771234005', isActive: true },
    ];

    const createdUsers: any[] = [];
    for (const u of users) {
      const [user] = await User.findOrCreate({ where: { email: u.email }, defaults: u as any });
      createdUsers.push(user);
    }
    console.log(`  ✅ Users: ${createdUsers.length}`);

    // ============================================
    // SUPPLIERS
    // ============================================
    console.log('🏢 Creating suppliers...');

    const suppliers = [
      { companyName: 'State Pharmaceuticals Corporation', contactPerson: 'Ruwan Jayawardena', email: 'ruwan@spc.lk', phoneNumber: '0112345001', address: '75 Sir Baron Jayatilaka Mawatha', city: 'Colombo', state: 'Western', zipCode: '00100', country: 'Sri Lanka', rating: 4.8, isActive: true },
      { companyName: 'Hemas Pharmaceuticals', contactPerson: 'Nadeesha Silva', email: 'nadeesha@hemas.com', phoneNumber: '0112345002', address: '36 Bristol Street', city: 'Colombo', state: 'Western', zipCode: '00100', country: 'Sri Lanka', rating: 4.6, isActive: true },
      { companyName: 'Astron Limited', contactPerson: 'Dinesh Kularatne', email: 'dinesh@astron.lk', phoneNumber: '0112345003', address: '765 Baseline Road', city: 'Colombo', state: 'Western', zipCode: '00900', country: 'Sri Lanka', rating: 4.5, isActive: true },
      { companyName: 'Healthguard Pharmacy', contactPerson: 'Malini Weerasinghe', email: 'malini@healthguard.lk', phoneNumber: '0112345004', address: '123 Galle Road', city: 'Dehiwala', state: 'Western', zipCode: '10350', country: 'Sri Lanka', rating: 4.3, isActive: true },
      { companyName: 'PharmaDirect International', contactPerson: 'David Chen', email: 'david@pharmadirect.com', phoneNumber: '0112345005', address: '45 Trade Center Blvd', city: 'Singapore', state: 'Central', zipCode: '018935', country: 'Singapore', rating: 4.7, isActive: true },
    ];

    const createdSuppliers: any[] = [];
    for (const s of suppliers) {
      const [supplier] = await Supplier.findOrCreate({ where: { email: s.email }, defaults: s as any });
      createdSuppliers.push(supplier);
    }
    console.log(`  ✅ Suppliers: ${createdSuppliers.length}`);

    // ============================================
    // MEDICINES — 40 items across many categories
    // ============================================
    console.log('💊 Creating medicines...');

    const medicines = [
      // Pain Relief (0-4)
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', brandName: 'Panadol', category: 'Pain Relief', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'GSK', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', brandName: 'Brufen', category: 'Pain Relief', dosageForm: 'Tablet', strength: '400mg', manufacturer: 'Abbott', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium', brandName: 'Voltaren', category: 'Pain Relief', dosageForm: 'Tablet', strength: '50mg', manufacturer: 'Novartis', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', brandName: 'Disprin', category: 'Pain Relief', dosageForm: 'Tablet', strength: '75mg', manufacturer: 'Bayer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Tramadol 50mg', genericName: 'Tramadol HCl', brandName: 'Tramal', category: 'Pain Relief', dosageForm: 'Capsule', strength: '50mg', manufacturer: 'Grunenthal', requiresPrescription: true, isControlledSubstance: true, isActive: true },

      // Antibiotics (5-9)
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', brandName: 'Amoxil', category: 'Antibiotic', dosageForm: 'Capsule', strength: '500mg', manufacturer: 'GSK', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Azithromycin 250mg', genericName: 'Azithromycin', brandName: 'Zithromax', category: 'Antibiotic', dosageForm: 'Tablet', strength: '250mg', manufacturer: 'Pfizer', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', brandName: 'Ciprobay', category: 'Antibiotic', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'Bayer', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Cephalexin 500mg', genericName: 'Cephalexin', brandName: 'Keflex', category: 'Antibiotic', dosageForm: 'Capsule', strength: '500mg', manufacturer: 'Eli Lilly', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Metronidazole 400mg', genericName: 'Metronidazole', brandName: 'Flagyl', category: 'Antibiotic', dosageForm: 'Tablet', strength: '400mg', manufacturer: 'Sanofi', requiresPrescription: true, isControlledSubstance: false, isActive: true },

      // Cardiovascular (10-14)
      { name: 'Atorvastatin 20mg', genericName: 'Atorvastatin', brandName: 'Lipitor', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '20mg', manufacturer: 'Pfizer', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Lisinopril 10mg', genericName: 'Lisinopril', brandName: 'Zestril', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'AstraZeneca', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Amlodipine 5mg', genericName: 'Amlodipine', brandName: 'Norvasc', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '5mg', manufacturer: 'Pfizer', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Metoprolol 50mg', genericName: 'Metoprolol', brandName: 'Lopressor', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '50mg', manufacturer: 'Novartis', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Losartan 50mg', genericName: 'Losartan Potassium', brandName: 'Cozaar', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '50mg', manufacturer: 'Merck', requiresPrescription: true, isControlledSubstance: false, isActive: true },

      // Diabetes (15-17)
      { name: 'Metformin 500mg', genericName: 'Metformin HCl', brandName: 'Glucophage', category: 'Diabetes', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'Merck', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Glimepiride 2mg', genericName: 'Glimepiride', brandName: 'Amaryl', category: 'Diabetes', dosageForm: 'Tablet', strength: '2mg', manufacturer: 'Sanofi', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Insulin Glargine', genericName: 'Insulin Glargine', brandName: 'Lantus', category: 'Diabetes', dosageForm: 'Injection', strength: '100IU/ml', manufacturer: 'Sanofi', requiresPrescription: true, isControlledSubstance: false, isActive: true },

      // Gastrointestinal (18-21)
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', brandName: 'Losec', category: 'Gastrointestinal', dosageForm: 'Capsule', strength: '20mg', manufacturer: 'AstraZeneca', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Ranitidine 150mg', genericName: 'Ranitidine', brandName: 'Zantac', category: 'Gastrointestinal', dosageForm: 'Tablet', strength: '150mg', manufacturer: 'GSK', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Domperidone 10mg', genericName: 'Domperidone', brandName: 'Motilium', category: 'Gastrointestinal', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'Janssen', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Loperamide 2mg', genericName: 'Loperamide', brandName: 'Imodium', category: 'Gastrointestinal', dosageForm: 'Capsule', strength: '2mg', manufacturer: 'Johnson & Johnson', requiresPrescription: false, isControlledSubstance: false, isActive: true },

      // Allergy & Respiratory (22-26)
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', brandName: 'Zyrtec', category: 'Allergy', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'UCB Pharma', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Loratadine 10mg', genericName: 'Loratadine', brandName: 'Claritin', category: 'Allergy', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'Schering-Plough', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Fexofenadine 120mg', genericName: 'Fexofenadine', brandName: 'Allegra', category: 'Allergy', dosageForm: 'Tablet', strength: '120mg', manufacturer: 'Sanofi', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Salbutamol Inhaler', genericName: 'Albuterol', brandName: 'Ventolin', category: 'Respiratory', dosageForm: 'Inhaler', strength: '100mcg', manufacturer: 'GSK', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Montelukast 10mg', genericName: 'Montelukast', brandName: 'Singulair', category: 'Respiratory', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'Merck', requiresPrescription: true, isControlledSubstance: false, isActive: true },

      // Vitamins & Supplements (27-32)
      { name: 'Vitamin C 500mg', genericName: 'Ascorbic Acid', brandName: 'Cevit', category: 'Vitamin', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'Nature Made', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Vitamin D3 1000IU', genericName: 'Cholecalciferol', brandName: 'D-Vita', category: 'Vitamin', dosageForm: 'Capsule', strength: '1000IU', manufacturer: 'Nature Made', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Calcium + Vitamin D', genericName: 'Calcium Carbonate + D3', brandName: 'Caltrate Plus', category: 'Supplement', dosageForm: 'Tablet', strength: '600mg+400IU', manufacturer: 'Pfizer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Multivitamin Daily', genericName: 'Multivitamin Complex', brandName: 'Centrum', category: 'Vitamin', dosageForm: 'Tablet', strength: 'Daily', manufacturer: 'Pfizer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Iron + Folic Acid', genericName: 'Ferrous Sulphate + Folic Acid', brandName: 'Fefol', category: 'Supplement', dosageForm: 'Capsule', strength: '150mg+0.5mg', manufacturer: 'GSK', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Omega-3 Fish Oil', genericName: 'EPA + DHA', brandName: "Nature's Bounty", category: 'Supplement', dosageForm: 'Softgel', strength: '1000mg', manufacturer: "Nature's Bounty", requiresPrescription: false, isControlledSubstance: false, isActive: true },

      // Cold & Flu (33-34)
      { name: 'Cough Syrup 100ml', genericName: 'Dextromethorphan', brandName: 'Benylin', category: 'Cold & Flu', dosageForm: 'Syrup', strength: '15mg/5ml', manufacturer: 'Johnson & Johnson', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Cold & Flu Tablets', genericName: 'Paracetamol + Phenylephrine', brandName: 'Coldrex', category: 'Cold & Flu', dosageForm: 'Tablet', strength: '500mg+10mg', manufacturer: 'GSK', requiresPrescription: false, isControlledSubstance: false, isActive: true },

      // Topical / Skin (35-37)
      { name: 'Hydrocortisone Cream 1%', genericName: 'Hydrocortisone', brandName: 'Cortaid', category: 'Topical', dosageForm: 'Cream', strength: '1%', manufacturer: 'Johnson & Johnson', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Clotrimazole Cream', genericName: 'Clotrimazole', brandName: 'Canesten', category: 'Antifungal', dosageForm: 'Cream', strength: '1%', manufacturer: 'Bayer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Betadine Solution', genericName: 'Povidone-Iodine', brandName: 'Betadine', category: 'Antiseptic', dosageForm: 'Solution', strength: '10%', manufacturer: 'Mundipharma', requiresPrescription: false, isControlledSubstance: false, isActive: true },

      // Mental Health (38-39)
      { name: 'Sertraline 50mg', genericName: 'Sertraline HCl', brandName: 'Zoloft', category: 'Mental Health', dosageForm: 'Tablet', strength: '50mg', manufacturer: 'Pfizer', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Diazepam 5mg', genericName: 'Diazepam', brandName: 'Valium', category: 'Mental Health', dosageForm: 'Tablet', strength: '5mg', manufacturer: 'Roche', requiresPrescription: true, isControlledSubstance: true, isActive: true },
    ];

    const createdMedicines: any[] = [];
    for (const m of medicines) {
      const [medicine] = await Medicine.findOrCreate({ where: { name: m.name }, defaults: m as any });
      createdMedicines.push(medicine);
    }
    console.log(`  ✅ Medicines: ${createdMedicines.length}`);

    // ============================================
    // CUSTOMERS — 12 diverse customers
    // ============================================
    console.log('👤 Creating customers...');

    const customers = [
      { firstName: 'Saman', lastName: 'Kumara', phoneNumber: '0771000001', email: 'saman.k@email.com', address: '45 Temple Road, Kandy', dateOfBirth: new Date('1978-05-15'), loyaltyPoints: 2450, isActive: true },
      { firstName: 'Nimali', lastName: 'Fernando', phoneNumber: '0771000002', email: 'nimali.f@email.com', address: '123 Galle Road, Colombo 03', dateOfBirth: new Date('1985-09-22'), loyaltyPoints: 1890, isActive: true },
      { firstName: 'Ruwan', lastName: 'Jayasuriya', phoneNumber: '0771000003', email: 'ruwan.j@email.com', address: '78 Station Road, Gampaha', dateOfBirth: new Date('1992-03-10'), loyaltyPoints: 560, isActive: true },
      { firstName: 'Kamala', lastName: 'Wickramasinghe', phoneNumber: '0771000004', email: 'kamala.w@email.com', address: '15 Lake Drive, Kandy', dateOfBirth: new Date('1965-11-30'), loyaltyPoints: 4200, isActive: true },
      { firstName: 'Pradeep', lastName: 'Silva', phoneNumber: '0771000005', email: 'pradeep.s@email.com', address: '232 Duplication Road, Colombo 04', dateOfBirth: new Date('1988-07-18'), loyaltyPoints: 980, isActive: true },
      { firstName: 'Anoma', lastName: 'Rajapaksa', phoneNumber: '0771000006', email: 'anoma.r@email.com', address: '56 Hill Street, Nuwara Eliya', dateOfBirth: new Date('1970-02-25'), loyaltyPoints: 3150, isActive: true },
      { firstName: 'Dinesh', lastName: 'Perera', phoneNumber: '0771000007', email: 'dinesh.p@email.com', address: '89 Main Street, Matara', dateOfBirth: new Date('1995-12-05'), loyaltyPoints: 320, isActive: true },
      { firstName: 'Hasini', lastName: 'Dias', phoneNumber: '0771000008', email: 'hasini.d@email.com', address: '67 Beach Road, Negombo', dateOfBirth: new Date('1982-08-14'), loyaltyPoints: 1640, isActive: true },
      { firstName: 'Chaminda', lastName: 'Bandara', phoneNumber: '0771000009', email: 'chaminda.b@email.com', address: '12 Kandy Road, Kurunegala', dateOfBirth: new Date('1975-04-08'), loyaltyPoints: 2890, isActive: true },
      { firstName: 'Dilani', lastName: 'Gunawardena', phoneNumber: '0771000010', email: 'dilani.g@email.com', address: '34 Hospital Road, Galle', dateOfBirth: new Date('1990-06-20'), loyaltyPoints: 750, isActive: true },
      { firstName: 'Mahesh', lastName: 'Senanayake', phoneNumber: '0771000011', email: 'mahesh.s@email.com', address: '201 High Level Road, Maharagama', dateOfBirth: new Date('1968-01-12'), loyaltyPoints: 5100, isActive: true },
      { firstName: 'Sanduni', lastName: 'Abeywickrama', phoneNumber: '0771000012', email: 'sanduni.a@email.com', address: '45 Clock Tower Road, Jaffna', dateOfBirth: new Date('1998-10-03'), loyaltyPoints: 180, isActive: true },
    ];

    const createdCustomers: any[] = [];
    for (const c of customers) {
      const [customer] = await Customer.findOrCreate({ where: { phoneNumber: c.phoneNumber }, defaults: c as any });
      createdCustomers.push(customer);
    }
    console.log(`  ✅ Customers: ${createdCustomers.length}`);

    // ============================================
    // INVENTORY — every medicine gets a batch
    // ============================================
    console.log('📦 Creating inventory...');

    const stockProfiles = [
      // High stock (indices 0-4: pain relief)
      { quantity: 500, unitPrice: 1.50, sellingPrice: 3.50, daysToExpiry: 540, reorderLevel: 50 },
      { quantity: 450, unitPrice: 3.20, sellingPrice: 7.00, daysToExpiry: 480, reorderLevel: 60 },
      { quantity: 380, unitPrice: 5.00, sellingPrice: 12.00, daysToExpiry: 420, reorderLevel: 45 },
      { quantity: 320, unitPrice: 1.80, sellingPrice: 4.50, daysToExpiry: 510, reorderLevel: 40 },
      { quantity: 280, unitPrice: 22.00, sellingPrice: 48.00, daysToExpiry: 365, reorderLevel: 30 },
      // Antibiotics (5-9)
      { quantity: 200, unitPrice: 12.50, sellingPrice: 27.00, daysToExpiry: 300, reorderLevel: 35 },
      { quantity: 180, unitPrice: 8.00, sellingPrice: 18.00, daysToExpiry: 350, reorderLevel: 40 },
      { quantity: 160, unitPrice: 15.00, sellingPrice: 32.00, daysToExpiry: 280, reorderLevel: 30 },
      { quantity: 200, unitPrice: 10.00, sellingPrice: 22.00, daysToExpiry: 320, reorderLevel: 35 },
      { quantity: 150, unitPrice: 6.50, sellingPrice: 14.00, daysToExpiry: 290, reorderLevel: 30 },
      // Cardiovascular (10-14)
      { quantity: 250, unitPrice: 8.50, sellingPrice: 18.50, daysToExpiry: 400, reorderLevel: 40 },
      { quantity: 220, unitPrice: 7.00, sellingPrice: 15.00, daysToExpiry: 380, reorderLevel: 35 },
      { quantity: 200, unitPrice: 6.20, sellingPrice: 13.50, daysToExpiry: 360, reorderLevel: 35 },
      { quantity: 180, unitPrice: 9.00, sellingPrice: 20.00, daysToExpiry: 340, reorderLevel: 30 },
      { quantity: 170, unitPrice: 7.50, sellingPrice: 16.50, daysToExpiry: 310, reorderLevel: 30 },
      // Diabetes (15-17)
      { quantity: 300, unitPrice: 4.00, sellingPrice: 9.00, daysToExpiry: 450, reorderLevel: 50 },
      { quantity: 140, unitPrice: 11.00, sellingPrice: 24.00, daysToExpiry: 260, reorderLevel: 25 },
      { quantity: 60, unitPrice: 85.00, sellingPrice: 180.00, daysToExpiry: 180, reorderLevel: 15 },
      // Gastrointestinal (18-21)
      { quantity: 350, unitPrice: 5.50, sellingPrice: 12.50, daysToExpiry: 400, reorderLevel: 45 },
      { quantity: 280, unitPrice: 3.80, sellingPrice: 8.50, daysToExpiry: 380, reorderLevel: 40 },
      { quantity: 220, unitPrice: 4.20, sellingPrice: 9.50, daysToExpiry: 320, reorderLevel: 35 },
      { quantity: 190, unitPrice: 2.80, sellingPrice: 6.50, daysToExpiry: 300, reorderLevel: 30 },
      // Allergy & Respiratory (22-26)
      { quantity: 400, unitPrice: 2.50, sellingPrice: 5.50, daysToExpiry: 520, reorderLevel: 55 },
      { quantity: 350, unitPrice: 3.00, sellingPrice: 6.50, daysToExpiry: 490, reorderLevel: 50 },
      { quantity: 280, unitPrice: 4.80, sellingPrice: 10.50, daysToExpiry: 440, reorderLevel: 40 },
      { quantity: 120, unitPrice: 25.00, sellingPrice: 55.00, daysToExpiry: 250, reorderLevel: 20 },
      { quantity: 160, unitPrice: 12.00, sellingPrice: 26.00, daysToExpiry: 300, reorderLevel: 25 },
      // Vitamins (27-32) — high stock
      { quantity: 600, unitPrice: 1.20, sellingPrice: 3.00, daysToExpiry: 720, reorderLevel: 80 },
      { quantity: 500, unitPrice: 2.00, sellingPrice: 5.00, daysToExpiry: 680, reorderLevel: 70 },
      { quantity: 400, unitPrice: 3.50, sellingPrice: 8.00, daysToExpiry: 650, reorderLevel: 60 },
      { quantity: 550, unitPrice: 2.80, sellingPrice: 6.50, daysToExpiry: 700, reorderLevel: 75 },
      { quantity: 300, unitPrice: 2.50, sellingPrice: 5.50, daysToExpiry: 600, reorderLevel: 50 },
      { quantity: 250, unitPrice: 6.00, sellingPrice: 13.00, daysToExpiry: 550, reorderLevel: 40 },
      // Cold & flu (33-34)
      { quantity: 320, unitPrice: 5.50, sellingPrice: 12.00, daysToExpiry: 400, reorderLevel: 45 },
      { quantity: 280, unitPrice: 4.00, sellingPrice: 9.00, daysToExpiry: 380, reorderLevel: 40 },
      // Topical — expiring soon for alerts (35-37)
      { quantity: 85, unitPrice: 5.00, sellingPrice: 11.00, daysToExpiry: 42, reorderLevel: 20 },
      { quantity: 95, unitPrice: 4.50, sellingPrice: 10.00, daysToExpiry: 38, reorderLevel: 22 },
      { quantity: 110, unitPrice: 3.00, sellingPrice: 7.00, daysToExpiry: 55, reorderLevel: 25 },
      // Mental health — low stock for alerts (38-39)
      { quantity: 18, unitPrice: 15.00, sellingPrice: 32.00, daysToExpiry: 280, reorderLevel: 30 },
      { quantity: 8, unitPrice: 18.00, sellingPrice: 38.00, daysToExpiry: 240, reorderLevel: 25 },
    ];

    let inventoryCount = 0;
    for (let i = 0; i < createdMedicines.length; i++) {
      const med = createdMedicines[i];
      const sup = createdSuppliers[i % createdSuppliers.length];
      const profile = stockProfiles[i];

      const mfgDate = new Date();
      mfgDate.setDate(mfgDate.getDate() - 180);
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + profile.daysToExpiry);

      await Inventory.findOrCreate({
        where: { batchNumber: `BATCH-${String(i + 1).padStart(4, '0')}` },
        defaults: {
          medicineId: getId(med),
          batchNumber: `BATCH-${String(i + 1).padStart(4, '0')}`,
          quantity: profile.quantity,
          unitPrice: profile.unitPrice,
          sellingPrice: profile.sellingPrice,
          manufacturingDate: mfgDate,
          expiryDate: expDate,
          reorderLevel: profile.reorderLevel,
          supplierName: sup.get?.('companyName') ?? sup.companyName,
        } as any,
      });
      inventoryCount++;
    }
    console.log(`  ✅ Inventory batches: ${inventoryCount}`);

    // ============================================
    // PRESCRIPTIONS — 8 prescriptions, various statuses
    // ============================================
    console.log('📋 Creating prescriptions...');

    const staffUser = createdUsers.find((u: any) => (u.get?.('role') ?? u.role) === 'staff');
    const staffId = staffUser ? getId(staffUser) : undefined;
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const prescriptions = [
      {
        prescriptionNumber: 'RX-2026-00001',
        patientName: 'Saman Kumara', patientPhone: '0771000001',
        doctorName: 'Dr. Anil Gunawardena', doctorLicense: 'SLMC-12345', hospitalName: 'Kandy General Hospital',
        medications: [
          { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
          { name: 'Omeprazole 20mg', dosage: '20mg', frequency: 'Once daily before breakfast', duration: '14 days' },
        ],
        prescriptionDate: new Date(now - 5 * DAY), validUntil: new Date(now + 25 * DAY),
        notes: 'Take antibiotics with food. Complete full course.',
        status: 'verified' as const, verifiedBy: staffId, verifiedAt: new Date(now - 4 * DAY),
        createdBy: staffId,
      },
      {
        prescriptionNumber: 'RX-2026-00002',
        patientName: 'Nimali Fernando', patientPhone: '0771000002',
        doctorName: 'Dr. Shantha Perera', doctorLicense: 'SLMC-23456', hospitalName: 'Colombo National Hospital',
        medications: [
          { name: 'Lisinopril 10mg', dosage: '10mg', frequency: 'Once daily morning', duration: '30 days' },
          { name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '30 days' },
          { name: 'Aspirin 75mg', dosage: '75mg', frequency: 'Once daily after lunch', duration: '30 days' },
        ],
        prescriptionDate: new Date(now - 3 * DAY), validUntil: new Date(now + 27 * DAY),
        notes: 'Monitor blood pressure weekly. Low-salt diet recommended.',
        status: 'verified' as const, verifiedBy: staffId, verifiedAt: new Date(now - 2 * DAY),
        createdBy: staffId,
      },
      {
        prescriptionNumber: 'RX-2026-00003',
        patientName: 'Kamala Wickramasinghe', patientPhone: '0771000004',
        doctorName: 'Dr. Lasitha Bandara', doctorLicense: 'SLMC-34567', hospitalName: 'Peradeniya Teaching Hospital',
        medications: [
          { name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily with meals', duration: '30 days' },
          { name: 'Glimepiride 2mg', dosage: '2mg', frequency: 'Once daily before breakfast', duration: '30 days' },
        ],
        prescriptionDate: new Date(now - 1 * DAY), validUntil: new Date(now + 29 * DAY),
        notes: 'Follow dietary guidelines. Check blood sugar daily.',
        status: 'pending' as const, verifiedBy: null, verifiedAt: null,
        createdBy: staffId,
      },
      {
        prescriptionNumber: 'RX-2026-00004',
        patientName: 'Pradeep Silva', patientPhone: '0771000005',
        doctorName: 'Dr. Kumari Silva', doctorLicense: 'SLMC-45678', hospitalName: 'Lanka Hospital',
        medications: [
          { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: '2 puffs as needed', duration: '30 days' },
          { name: 'Montelukast 10mg', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '30 days' },
        ],
        prescriptionDate: new Date(now - 2 * DAY), validUntil: new Date(now + 28 * DAY),
        notes: 'Use inhaler before exercise. Avoid known allergens.',
        status: 'pending' as const, verifiedBy: null, verifiedAt: null,
        createdBy: staffId,
      },
      {
        prescriptionNumber: 'RX-2026-00005',
        patientName: 'Chaminda Bandara', patientPhone: '0771000009',
        doctorName: 'Dr. Anil Gunawardena', doctorLicense: 'SLMC-12345', hospitalName: 'Kandy General Hospital',
        medications: [
          { name: 'Azithromycin 250mg', dosage: '250mg', frequency: 'Once daily', duration: '5 days' },
          { name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once daily at night', duration: '10 days' },
          { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'When needed, max 4 times daily', duration: '5 days' },
        ],
        prescriptionDate: new Date(now - 10 * DAY), validUntil: new Date(now + 20 * DAY),
        notes: 'Plenty of fluids. Rest for 3 days.',
        status: 'dispensed' as const, verifiedBy: staffId, verifiedAt: new Date(now - 9 * DAY),
        createdBy: staffId,
      },
      {
        prescriptionNumber: 'RX-2026-00006',
        patientName: 'Anoma Rajapaksa', patientPhone: '0771000006',
        doctorName: 'Dr. Shantha Perera', doctorLicense: 'SLMC-23456', hospitalName: 'Colombo National Hospital',
        medications: [
          { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
          { name: 'Metoprolol 50mg', dosage: '50mg', frequency: 'Twice daily', duration: '30 days' },
        ],
        prescriptionDate: new Date(now - 8 * DAY), validUntil: new Date(now + 22 * DAY),
        notes: 'Avoid strenuous exercise. Regular BP monitoring.',
        status: 'dispensed' as const, verifiedBy: staffId, verifiedAt: new Date(now - 7 * DAY),
        createdBy: staffId,
      },
      {
        prescriptionNumber: 'RX-2026-00007',
        patientName: 'Dinesh Perera', patientPhone: '0771000007',
        doctorName: 'Dr. Kumari Silva', doctorLicense: 'SLMC-45678', hospitalName: 'Lanka Hospital',
        medications: [
          { name: 'Sertraline 50mg', dosage: '50mg', frequency: 'Once daily in the morning', duration: '30 days' },
        ],
        prescriptionDate: new Date(now - 15 * DAY), validUntil: new Date(now - 1 * DAY),
        notes: 'Follow-up in 4 weeks. Avoid alcohol.',
        status: 'rejected' as const, verifiedBy: staffId, verifiedAt: new Date(now - 14 * DAY),
        createdBy: staffId,
      },
      {
        prescriptionNumber: 'RX-2026-00008',
        patientName: 'Sanduni Abeywickrama', patientPhone: '0771000012',
        doctorName: 'Dr. Lasitha Bandara', doctorLicense: 'SLMC-34567', hospitalName: 'Peradeniya Teaching Hospital',
        medications: [
          { name: 'Ciprofloxacin 500mg', dosage: '500mg', frequency: 'Twice daily', duration: '7 days' },
          { name: 'Domperidone 10mg', dosage: '10mg', frequency: 'Three times daily before meals', duration: '5 days' },
        ],
        prescriptionDate: new Date(), validUntil: new Date(now + 30 * DAY),
        notes: 'Drink plenty of water. Return if symptoms persist after 3 days.',
        status: 'pending' as const, verifiedBy: null, verifiedAt: null,
        createdBy: staffId,
      },
    ];

    for (const rx of prescriptions) {
      const existing = await Prescription.findOne({ where: { prescriptionNumber: rx.prescriptionNumber } });
      if (!existing) {
        await Prescription.create(rx as any);
      }
    }
    console.log(`  ✅ Prescriptions: ${prescriptions.length}`);

    // ============================================
    // SALES — 20 sales spread over the last 30 days
    // ============================================
    console.log('💰 Creating sales...');

    const cashierId = staffId;

    // helper to build sale items
    const saleItem = (medIdx: number, qty: number) => {
      const med = createdMedicines[medIdx];
      const sp = stockProfiles[medIdx];
      const total = qty * sp.sellingPrice;
      return { medicineId: getId(med), medicineName: med.get?.('name') ?? med.name, batchNumber: `BATCH-${String(medIdx + 1).padStart(4, '0')}`, quantity: qty, unitPrice: sp.sellingPrice, discount: 0, total };
    };

    const salesData = [
      // Today
      { customerName: 'Saman Kumara', customerPhone: '0771000001', daysAgo: 0, payment: 'cash' as const, items: [saleItem(0, 3), saleItem(22, 2)] },
      { customerName: 'Nimali Fernando', customerPhone: '0771000002', daysAgo: 0, payment: 'card' as const, items: [saleItem(10, 2), saleItem(11, 1), saleItem(29, 3)] },
      { customerName: 'Dilani Gunawardena', customerPhone: '0771000010', daysAgo: 0, payment: 'cash' as const, items: [saleItem(27, 5), saleItem(28, 2)] },
      // Yesterday
      { customerName: 'Pradeep Silva', customerPhone: '0771000005', daysAgo: 1, payment: 'card' as const, items: [saleItem(5, 1), saleItem(18, 2)] },
      { customerName: 'Hasini Dias', customerPhone: '0771000008', daysAgo: 1, payment: 'cash' as const, items: [saleItem(0, 5), saleItem(19, 3), saleItem(33, 1)] },
      // 2 days ago
      { customerName: 'Kamala Wickramasinghe', customerPhone: '0771000004', daysAgo: 2, payment: 'card' as const, items: [saleItem(15, 4), saleItem(16, 2)] },
      { customerName: 'Ruwan Jayasuriya', customerPhone: '0771000003', daysAgo: 2, payment: 'cash' as const, items: [saleItem(22, 3), saleItem(23, 2), saleItem(27, 4)] },
      // 3 days ago
      { customerName: 'Anoma Rajapaksa', customerPhone: '0771000006', daysAgo: 3, payment: 'cash' as const, items: [saleItem(12, 2), saleItem(13, 2)] },
      { customerName: 'Dinesh Perera', customerPhone: '0771000007', daysAgo: 3, payment: 'card' as const, items: [saleItem(0, 10), saleItem(34, 1)] },
      // 4 days ago
      { customerName: 'Mahesh Senanayake', customerPhone: '0771000011', daysAgo: 4, payment: 'cash' as const, items: [saleItem(10, 3), saleItem(14, 2), saleItem(3, 5)] },
      // 5 days ago
      { customerName: 'Sanduni Abeywickrama', customerPhone: '0771000012', daysAgo: 5, payment: 'cash' as const, items: [saleItem(22, 2), saleItem(30, 3)] },
      { customerName: 'Chaminda Bandara', customerPhone: '0771000009', daysAgo: 5, payment: 'cash' as const, items: [saleItem(6, 1), saleItem(25, 1)] },
      // 7 days ago
      { customerName: 'Saman Kumara', customerPhone: '0771000001', daysAgo: 7, payment: 'card' as const, items: [saleItem(0, 2), saleItem(22, 5), saleItem(32, 2)] },
      { customerName: 'Nimali Fernando', customerPhone: '0771000002', daysAgo: 7, payment: 'cash' as const, items: [saleItem(11, 2), saleItem(14, 1)] },
      // 10 days ago
      { customerName: 'Hasini Dias', customerPhone: '0771000008', daysAgo: 10, payment: 'card' as const, items: [saleItem(5, 2), saleItem(7, 1), saleItem(19, 2)] },
      { customerName: 'Pradeep Silva', customerPhone: '0771000005', daysAgo: 10, payment: 'cash' as const, items: [saleItem(27, 3), saleItem(28, 2), saleItem(31, 4)] },
      // 15 days ago
      { customerName: 'Kamala Wickramasinghe', customerPhone: '0771000004', daysAgo: 15, payment: 'cash' as const, items: [saleItem(15, 6), saleItem(17, 1)] },
      { customerName: 'Anoma Rajapaksa', customerPhone: '0771000006', daysAgo: 15, payment: 'card' as const, items: [saleItem(10, 2), saleItem(12, 3)] },
      // 20 days ago
      { customerName: 'Mahesh Senanayake', customerPhone: '0771000011', daysAgo: 20, payment: 'cash' as const, items: [saleItem(0, 8), saleItem(22, 4), saleItem(30, 3)] },
      // 25 days ago
      { customerName: 'Ruwan Jayasuriya', customerPhone: '0771000003', daysAgo: 25, payment: 'card' as const, items: [saleItem(8, 1), saleItem(9, 1), saleItem(19, 2)] },
    ];

    let salesCount = 0;
    for (let i = 0; i < salesData.length; i++) {
      const s = salesData[i];
      const items = s.items;
      const subtotal = items.reduce((sum, it) => sum + it.total, 0);
      const discount = i % 5 === 0 ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
      const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
      const totalAmount = Math.round((subtotal - discount + tax) * 100) / 100;

      const saleDate = new Date(now - s.daysAgo * DAY);
      saleDate.setHours(8 + (i % 10), (i * 7) % 60, (i * 13) % 60);

      const invoiceNumber = `INV-${saleDate.getFullYear()}${String(saleDate.getMonth() + 1).padStart(2, '0')}${String(saleDate.getDate()).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`;

      const existing = await Sale.findOne({ where: { invoiceNumber } });
      if (!existing) {
        await Sale.create({
          invoiceNumber,
          cashierId,
          customerName: s.customerName,
          customerPhone: s.customerPhone,
          items,
          subtotal,
          discount,
          tax,
          totalAmount,
          paymentMethod: s.payment,
          paymentStatus: 'paid',
          amountPaid: totalAmount,
          changeGiven: 0,
          saleDate,
        } as any);
        salesCount++;
      }
    }
    console.log(`  ✅ Sales: ${salesCount}`);

    // ============================================
    // PURCHASE ORDERS — 5 orders, various statuses
    // ============================================
    console.log('📝 Creating purchase orders...');

    const adminUser = createdUsers.find((u: any) => (u.get?.('role') ?? u.role) === 'admin');
    const adminId = adminUser ? getId(adminUser) : undefined;

    const purchaseOrders = [
      {
        orderNumber: 'PO-2026-0001',
        supplierId: getId(createdSuppliers[0]),
        orderDate: new Date(now - 20 * DAY),
        expectedDeliveryDate: new Date(now - 13 * DAY),
        actualDeliveryDate: new Date(now - 12 * DAY),
        status: 'received' as const,
        items: [
          { medicineId: getId(createdMedicines[0]), medicineName: 'Paracetamol 500mg', quantity: 1000, unitPrice: 1.50, totalPrice: 1500.00 },
          { medicineId: getId(createdMedicines[5]), medicineName: 'Amoxicillin 500mg', quantity: 500, unitPrice: 12.50, totalPrice: 6250.00 },
        ],
        subtotal: 7750.00, tax: 387.50, shippingCost: 250.00, discount: 0, totalAmount: 8387.50,
        paymentStatus: 'paid' as const, paidAmount: 8387.50, paymentMethod: 'bank_transfer',
        notes: 'Delivered on time. Quality verified.',
        createdBy: adminId, approvedBy: adminId, receivedBy: staffId,
      },
      {
        orderNumber: 'PO-2026-0002',
        supplierId: getId(createdSuppliers[1]),
        orderDate: new Date(now - 10 * DAY),
        expectedDeliveryDate: new Date(now - 3 * DAY),
        actualDeliveryDate: new Date(now - 2 * DAY),
        status: 'received' as const,
        items: [
          { medicineId: getId(createdMedicines[10]), medicineName: 'Atorvastatin 20mg', quantity: 300, unitPrice: 8.50, totalPrice: 2550.00 },
          { medicineId: getId(createdMedicines[15]), medicineName: 'Metformin 500mg', quantity: 500, unitPrice: 4.00, totalPrice: 2000.00 },
          { medicineId: getId(createdMedicines[22]), medicineName: 'Cetirizine 10mg', quantity: 800, unitPrice: 2.50, totalPrice: 2000.00 },
        ],
        subtotal: 6550.00, tax: 327.50, shippingCost: 200.00, discount: 150.00, totalAmount: 6927.50,
        paymentStatus: 'paid' as const, paidAmount: 6927.50, paymentMethod: 'bank_transfer',
        notes: 'Minor delay. All items in good condition.',
        createdBy: adminId, approvedBy: adminId, receivedBy: staffId,
      },
      {
        orderNumber: 'PO-2026-0003',
        supplierId: getId(createdSuppliers[2]),
        orderDate: new Date(now - 3 * DAY),
        expectedDeliveryDate: new Date(now + 4 * DAY),
        status: 'ordered' as const,
        items: [
          { medicineId: getId(createdMedicines[38]), medicineName: 'Sertraline 50mg', quantity: 200, unitPrice: 15.00, totalPrice: 3000.00 },
          { medicineId: getId(createdMedicines[39]), medicineName: 'Diazepam 5mg', quantity: 100, unitPrice: 18.00, totalPrice: 1800.00 },
          { medicineId: getId(createdMedicines[25]), medicineName: 'Salbutamol Inhaler', quantity: 150, unitPrice: 25.00, totalPrice: 3750.00 },
        ],
        subtotal: 8550.00, tax: 427.50, shippingCost: 300.00, discount: 0, totalAmount: 9277.50,
        paymentStatus: 'unpaid' as const, paidAmount: 0,
        notes: 'Rush order — low stock on mental health medications.',
        createdBy: adminId, approvedBy: adminId,
      },
      {
        orderNumber: 'PO-2026-0004',
        supplierId: getId(createdSuppliers[3]),
        orderDate: new Date(now - 1 * DAY),
        expectedDeliveryDate: new Date(now + 7 * DAY),
        status: 'pending' as const,
        items: [
          { medicineId: getId(createdMedicines[27]), medicineName: 'Vitamin C 500mg', quantity: 2000, unitPrice: 1.20, totalPrice: 2400.00 },
          { medicineId: getId(createdMedicines[30]), medicineName: 'Multivitamin Daily', quantity: 1000, unitPrice: 2.80, totalPrice: 2800.00 },
          { medicineId: getId(createdMedicines[31]), medicineName: 'Iron + Folic Acid', quantity: 500, unitPrice: 2.50, totalPrice: 1250.00 },
        ],
        subtotal: 6450.00, tax: 322.50, shippingCost: 150.00, discount: 200.00, totalAmount: 6722.50,
        paymentStatus: 'unpaid' as const, paidAmount: 0,
        notes: 'Seasonal restock for vitamins and supplements.',
        createdBy: adminId,
      },
      {
        orderNumber: 'PO-2026-0005',
        supplierId: getId(createdSuppliers[4]),
        orderDate: new Date(now - 30 * DAY),
        expectedDeliveryDate: new Date(now - 22 * DAY),
        actualDeliveryDate: new Date(now - 25 * DAY),
        status: 'received' as const,
        items: [
          { medicineId: getId(createdMedicines[17]), medicineName: 'Insulin Glargine', quantity: 100, unitPrice: 85.00, totalPrice: 8500.00 },
        ],
        subtotal: 8500.00, tax: 425.00, shippingCost: 500.00, discount: 0, totalAmount: 9425.00,
        paymentStatus: 'paid' as const, paidAmount: 9425.00, paymentMethod: 'bank_transfer',
        notes: 'Cold chain delivery verified. Stored at 2-8°C.',
        createdBy: adminId, approvedBy: adminId, receivedBy: staffId,
      },
    ];

    for (const po of purchaseOrders) {
      const existing = await PurchaseOrder.findOne({ where: { orderNumber: po.orderNumber } });
      if (!existing) {
        await PurchaseOrder.create(po as any);
      }
    }
    console.log(`  ✅ Purchase orders: ${purchaseOrders.length}`);

    // ============================================
    // NOTIFICATIONS
    // ============================================
    console.log('🔔 Creating notifications...');

    const notifications = [
      { userId: adminId, type: 'low_stock' as const, title: 'Low Stock Alert', message: 'Diazepam 5mg stock is critically low (8 units). Reorder immediately.', isRead: false },
      { userId: adminId, type: 'low_stock' as const, title: 'Low Stock Alert', message: 'Sertraline 50mg stock is below reorder level (18 units).', isRead: false },
      { userId: adminId, type: 'order_received' as const, title: 'Purchase Order Received', message: 'PO-2026-0002 from Hemas Pharmaceuticals has been received and verified.', isRead: true },
      { userId: staffId, type: 'prescription_pending' as const, title: 'New Prescription', message: 'New prescription RX-2026-0008 submitted by Sanduni Abeywickrama awaiting verification.', isRead: false },
      { userId: staffId, type: 'expiring_soon' as const, title: 'Expiring Soon', message: 'Hydrocortisone Cream 1% (BATCH-0036) expires in 42 days.', isRead: false },
      { userId: staffId, type: 'expiring_soon' as const, title: 'Expiring Soon', message: 'Clotrimazole Cream (BATCH-0037) expires in 38 days.', isRead: true },
      { userId: adminId, type: 'system' as const, title: 'Daily Sales Summary', message: "Today's sales: 3 transactions totaling Rs 245.85. Top seller: Cetirizine 10mg.", isRead: false },
      { userId: staffId, type: 'prescription_verified' as const, title: 'Prescription Verified', message: 'Prescription RX-2026-0002 for Nimali Fernando has been verified.', isRead: true },
    ];

    for (const n of notifications) {
      await Notification.create(n as any);
    }
    console.log(`  ✅ Notifications: ${notifications.length}`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATABASE SEED SUMMARY');
    console.log('='.repeat(60));
    console.log(`  👥 Users:            ${createdUsers.length} (1 admin, 2 staff, 2 users)`);
    console.log(`  🏢 Suppliers:        ${createdSuppliers.length}`);
    console.log(`  💊 Medicines:        ${createdMedicines.length} (${new Set(medicines.map(m => m.category)).size} categories)`);
    console.log(`  👤 Customers:        ${createdCustomers.length}`);
    console.log(`  📦 Inventory:        ${inventoryCount} batches`);
    console.log(`  📋 Prescriptions:    ${prescriptions.length}`);
    console.log(`  💰 Sales:            ${salesCount} transactions`);
    console.log(`  📝 Purchase Orders:  ${purchaseOrders.length}`);
    console.log(`  🔔 Notifications:    ${notifications.length}`);
    console.log('='.repeat(60));
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('-'.repeat(60));
    console.log('  Admin:       admin@pharmacy.com / admin123');
    console.log('  Pharmacist:  pharmacist@pharmacy.com / pharmacist123');
    console.log('  Staff:       staff2@pharmacy.com / staff123');
    console.log('  User:        user@pharmacy.com / user123');
    console.log('='.repeat(60));
    console.log('\n💡 DEMO HIGHLIGHTS:');
    console.log('  ✓ Low stock items (8-18 units) → dashboard alerts');
    console.log('  ✓ Expiring items (38-55 days) → inventory alerts');
    console.log('  ✓ 3 pending prescriptions → OCR & verification demo');
    console.log('  ✓ 2 dispensed prescriptions → prescription history');
    console.log('  ✓ 20 sales over 25 days → charts & analytics');
    console.log('  ✓ 5 purchase orders → supplier management');
    console.log('  ✓ 12 customers with loyalty points → POS demo');
    console.log('  ✓ Controlled substances flagged → drug interaction demo');
    console.log('='.repeat(60));
    console.log('\n✅ Database seeded successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
