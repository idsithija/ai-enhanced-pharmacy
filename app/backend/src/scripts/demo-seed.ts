import { connectDatabase } from '../config/database.js';
import { User, Medicine, Inventory, Customer, Supplier, Prescription, Sale, PurchaseOrder } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const demoSeed = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    
    console.log('🌱 Starting DEMO database seeding...\n');

    // ============================================
    // USERS - Different roles for demo
    // ============================================
    console.log('👥 Creating users...');
    
    const users = [
      {
        username: 'admin',
        email: 'admin@pharmacy.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Manager',
        role: 'admin',
        phoneNumber: '555-0001',
        isActive: true,
      },
      {
        username: 'staff',
        email: 'staff@pharmacy.com',
        password: 'staff123',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'staff',
        phoneNumber: '555-0002',
        isActive: true,
      },
      {
        username: 'user',
        email: 'user@pharmacy.com',
        password: 'user123',
        firstName: 'Emily',
        lastName: 'Davis',
        role: 'user',
        phoneNumber: '555-0003',
        isActive: true,
      },
    ];

    for (const user of users) {
      await User.findOrCreate({ where: { email: user.email }, defaults: user as any });
    }
    console.log('✅ Users created (3)\n');

    // ============================================
    // SUPPLIERS
    // ============================================
    console.log('🏢 Creating suppliers...');
    
    const suppliers = [
      {
        companyName: 'MediSupply Corp',
        contactPerson: 'Michael Chen',
        email: 'michael@medisupply.com',
        phoneNumber: '555-1001',
        address: '123 Pharma Plaza',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        rating: 4.8,
        isActive: true,
      },
      {
        companyName: 'HealthWorks Distributors',
        contactPerson: 'Jennifer Martinez',
        email: 'jennifer@healthworks.com',
        phoneNumber: '555-1002',
        address: '456 Medical Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        rating: 4.5,
        isActive: true,
      },
      {
        companyName: 'PharmaDirect Inc',
        contactPerson: 'David Wilson',
        email: 'david@pharmadirect.com',
        phoneNumber: '555-1003',
        address: '789 Healthcare Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        rating: 4.7,
        isActive: true,
      },
    ];

    for (const supplier of suppliers) {
      await Supplier.findOrCreate({ where: { email: supplier.email }, defaults: supplier as any });
    }
    console.log('✅ Suppliers created (3)\n');

    // ============================================
    // MEDICINES - Comprehensive list for demo
    // ============================================
    console.log('💊 Creating medicines...');
    
    const medicines = [
      // Pain Relief
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', brandName: 'Tylenol', category: 'Pain Relief', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'Johnson & Johnson', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', brandName: 'Advil', category: 'Pain Relief', dosageForm: 'Tablet', strength: '400mg', manufacturer: 'Pfizer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', brandName: 'Bayer Aspirin', category: 'Pain Relief', dosageForm: 'Tablet', strength: '75mg', manufacturer: 'Bayer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium', brandName: 'Voltaren', category: 'Pain Relief', dosageForm: 'Tablet', strength: '50mg', manufacturer: 'Novartis', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      
      // Antibiotics
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', brandName: 'Amoxil', category: 'Antibiotic', dosageForm: 'Capsule', strength: '500mg', manufacturer: 'GSK', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Azithromycin 250mg', genericName: 'Azithromycin', brandName: 'Zithromax', category: 'Antibiotic', dosageForm: 'Tablet', strength: '250mg', manufacturer: 'Pfizer', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', brandName: 'Cipro', category: 'Antibiotic', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'Bayer', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Cephalexin 500mg', genericName: 'Cephalexin', brandName: 'Keflex', category: 'Antibiotic', dosageForm: 'Capsule', strength: '500mg', manufacturer: 'Eli Lilly', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      
      // Cardiovascular
      { name: 'Atorvastatin 20mg', genericName: 'Atorvastatin', brandName: 'Lipitor', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '20mg', manufacturer: 'Pfizer', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Lisinopril 10mg', genericName: 'Lisinopril', brandName: 'Prinivil', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'AstraZeneca', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Metoprolol 50mg', genericName: 'Metoprolol', brandName: 'Lopressor', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '50mg', manufacturer: 'Novartis', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Amlodipine 5mg', genericName: 'Amlodipine', brandName: 'Norvasc', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '5mg', manufacturer: 'Pfizer', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      
      // Diabetes
      { name: 'Metformin 500mg', genericName: 'Metformin HCl', brandName: 'Glucophage', category: 'Diabetes', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'Bristol-Myers Squibb', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Glimepiride 2mg', genericName: 'Glimepiride', brandName: 'Amaryl', category: 'Diabetes', dosageForm: 'Tablet', strength: '2mg', manufacturer: 'Sanofi', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      
      // Gastrointestinal
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', brandName: 'Prilosec', category: 'Gastrointestinal', dosageForm: 'Capsule', strength: '20mg', manufacturer: 'AstraZeneca', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Ranitidine 150mg', genericName: 'Ranitidine', brandName: 'Zantac', category: 'Gastrointestinal', dosageForm: 'Tablet', strength: '150mg', manufacturer: 'GSK', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Loperamide 2mg', genericName: 'Loperamide', brandName: 'Imodium', category: 'Gastrointestinal', dosageForm: 'Capsule', strength: '2mg', manufacturer: 'Johnson & Johnson', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      
      // Allergy
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', brandName: 'Zyrtec', category: 'Allergy', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'UCB Pharma', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Loratadine 10mg', genericName: 'Loratadine', brandName: 'Claritin', category: 'Allergy', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'Schering-Plough', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Fexofenadine 120mg', genericName: 'Fexofenadine', brandName: 'Allegra', category: 'Allergy', dosageForm: 'Tablet', strength: '120mg', manufacturer: 'Sanofi', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      
      // Respiratory
      { name: 'Salbutamol Inhaler', genericName: 'Albuterol', brandName: 'Ventolin', category: 'Respiratory', dosageForm: 'Inhaler', strength: '100mcg', manufacturer: 'GSK', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      { name: 'Montelukast 10mg', genericName: 'Montelukast', brandName: 'Singulair', category: 'Respiratory', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'Merck', requiresPrescription: true, isControlledSubstance: false, isActive: true },
      
      // Vitamins & Supplements
      { name: 'Vitamin C 500mg', genericName: 'Ascorbic Acid', brandName: 'Redoxon', category: 'Vitamin', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'Bayer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Vitamin D3 1000IU', genericName: 'Cholecalciferol', brandName: 'D-Vita', category: 'Vitamin', dosageForm: 'Capsule', strength: '1000IU', manufacturer: 'Nature Made', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Calcium 600mg', genericName: 'Calcium Carbonate', brandName: 'Caltrate', category: 'Supplement', dosageForm: 'Tablet', strength: '600mg', manufacturer: 'Pfizer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Multivitamin', genericName: 'Multivitamin Complex', brandName: 'Centrum', category: 'Vitamin', dosageForm: 'Tablet', strength: 'Daily', manufacturer: 'Pfizer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      
      // Cold & Flu
      { name: 'Cough Syrup 100ml', genericName: 'Dextromethorphan', brandName: 'Robitussin', category: 'Cold & Flu', dosageForm: 'Syrup', strength: '100ml', manufacturer: 'Pfizer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Paracetamol Cold & Flu', genericName: 'Paracetamol + Phenylephrine', brandName: 'Theraflu', category: 'Cold & Flu', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'GSK', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      
      // Skin Care
      { name: 'Hydrocortisone Cream 1%', genericName: 'Hydrocortisone', brandName: 'Cortaid', category: 'Topical', dosageForm: 'Cream', strength: '1%', manufacturer: 'Johnson & Johnson', requiresPrescription: false, isControlledSubstance: false, isActive: true },
      { name: 'Clotrimazole Cream', genericName: 'Clotrimazole', brandName: 'Lotrimin', category: 'Antifungal', dosageForm: 'Cream', strength: '1%', manufacturer: 'Bayer', requiresPrescription: false, isControlledSubstance: false, isActive: true },
    ];

    for (const medicine of medicines) {
      await Medicine.findOrCreate({ where: { name: medicine.name }, defaults: medicine as any });
    }
    console.log(`✅ Medicines created (${medicines.length})\n`);

    // ============================================
    // CUSTOMERS - Varied profiles for demo
    // ============================================
    console.log('👤 Creating customers...');
    
    const customers = [
      {
        firstName: 'Robert',
        lastName: 'Anderson',
        phoneNumber: '555-2001',
        email: 'robert.anderson@email.com',
        address: '123 Maple Street, Apt 4B',
        dateOfBirth: new Date('1978-05-15'),
        loyaltyPoints: 1250,
        isActive: true,
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        phoneNumber: '555-2002',
        email: 'maria.garcia@email.com',
        address: '456 Oak Avenue',
        dateOfBirth: new Date('1985-09-22'),
        loyaltyPoints: 890,
        isActive: true,
      },
      {
        firstName: 'James',
        lastName: 'Thompson',
        phoneNumber: '555-2003',
        email: 'james.thompson@email.com',
        address: '789 Pine Road',
        dateOfBirth: new Date('1992-03-10'),
        loyaltyPoints: 450,
        isActive: true,
      },
      {
        firstName: 'Linda',
        lastName: 'Williams',
        phoneNumber: '555-2004',
        email: 'linda.williams@email.com',
        address: '321 Elm Street',
        dateOfBirth: new Date('1965-11-30'),
        loyaltyPoints: 2100,
        isActive: true,
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        phoneNumber: '555-2005',
        email: 'michael.brown@email.com',
        address: '654 Cedar Lane',
        dateOfBirth: new Date('1988-07-18'),
        loyaltyPoints: 320,
        isActive: true,
      },
      {
        firstName: 'Patricia',
        lastName: 'Davis',
        phoneNumber: '555-2006',
        email: 'patricia.davis@email.com',
        address: '987 Birch Boulevard',
        dateOfBirth: new Date('1970-02-25'),
        loyaltyPoints: 1580,
        isActive: true,
      },
      {
        firstName: 'John',
        lastName: 'Miller',
        phoneNumber: '555-2007',
        email: 'john.miller@email.com',
        address: '147 Willow Way',
        dateOfBirth: new Date('1995-12-05'),
        loyaltyPoints: 95,
        isActive: true,
      },
      {
        firstName: 'Jennifer',
        lastName: 'Wilson',
        phoneNumber: '555-2008',
        email: 'jennifer.wilson@email.com',
        address: '258 Spruce Street',
        dateOfBirth: new Date('1982-08-14'),
        loyaltyPoints: 740,
        isActive: true,
      },
    ];

    for (const customer of customers) {
      await Customer.findOrCreate({ where: { phoneNumber: customer.phoneNumber }, defaults: customer as any });
    }
    console.log(`✅ Customers created (${customers.length})\n`);

    // ============================================
    // INVENTORY - Various stock levels for demo
    // ============================================
    console.log('📦 Creating inventory...');
    
    const medicineRecords = await Medicine.findAll();
    const supplierRecords = await Supplier.findAll();

    if (medicineRecords.length > 0 && supplierRecords.length > 0) {
      const inventoryData = [
        // High stock items
        { quantity: 500, unitPrice: 2.50, sellingPrice: 5.00, daysToExpiry: 450, reorderLevel: 50 },
        { quantity: 450, unitPrice: 3.00, sellingPrice: 6.50, daysToExpiry: 380, reorderLevel: 60 },
        { quantity: 400, unitPrice: 1.80, sellingPrice: 4.00, daysToExpiry: 520, reorderLevel: 40 },
        
        // Medium stock items
        { quantity: 150, unitPrice: 8.50, sellingPrice: 18.00, daysToExpiry: 280, reorderLevel: 30 },
        { quantity: 180, unitPrice: 12.00, sellingPrice: 25.00, daysToExpiry: 310, reorderLevel: 35 },
        { quantity: 200, unitPrice: 6.75, sellingPrice: 14.50, daysToExpiry: 220, reorderLevel: 40 },
        
        // Low stock items (for demand prediction demo)
        { quantity: 25, unitPrice: 15.00, sellingPrice: 32.00, daysToExpiry: 180, reorderLevel: 50 },
        { quantity: 18, unitPrice: 20.00, sellingPrice: 42.00, daysToExpiry: 195, reorderLevel: 40 },
        { quantity: 12, unitPrice: 22.50, sellingPrice: 48.00, daysToExpiry: 210, reorderLevel: 35 },
        
        // Critical stock items
        { quantity: 8, unitPrice: 18.00, sellingPrice: 38.00, daysToExpiry: 165, reorderLevel: 30 },
        { quantity: 5, unitPrice: 25.00, sellingPrice: 52.00, daysToExpiry: 240, reorderLevel: 25 },
        
        // Items expiring soon (for alerts demo)
        { quantity: 85, unitPrice: 4.50, sellingPrice: 9.50, daysToExpiry: 45, reorderLevel: 20 },
        { quantity: 120, unitPrice: 7.20, sellingPrice: 15.00, daysToExpiry: 38, reorderLevel: 30 },
        { quantity: 95, unitPrice: 3.80, sellingPrice: 8.00, daysToExpiry: 52, reorderLevel: 25 },
        
        // Normal stock
        { quantity: 250, unitPrice: 5.50, sellingPrice: 12.00, daysToExpiry: 420, reorderLevel: 45 },
        { quantity: 280, unitPrice: 4.20, sellingPrice: 9.00, daysToExpiry: 390, reorderLevel: 50 },
        { quantity: 220, unitPrice: 6.00, sellingPrice: 13.50, daysToExpiry: 350, reorderLevel: 40 },
        { quantity: 300, unitPrice: 2.80, sellingPrice: 6.00, daysToExpiry: 480, reorderLevel: 55 },
        { quantity: 190, unitPrice: 9.50, sellingPrice: 20.00, daysToExpiry: 290, reorderLevel: 35 },
        { quantity: 240, unitPrice: 7.80, sellingPrice: 16.50, daysToExpiry: 340, reorderLevel: 45 },
        
        // Additional items with varying levels
        { quantity: 160, unitPrice: 11.00, sellingPrice: 23.50, daysToExpiry: 270, reorderLevel: 30 },
        { quantity: 140, unitPrice: 13.50, sellingPrice: 28.00, daysToExpiry: 320, reorderLevel: 28 },
        { quantity: 320, unitPrice: 1.50, sellingPrice: 3.50, daysToExpiry: 540, reorderLevel: 60 },
        { quantity: 350, unitPrice: 1.80, sellingPrice: 4.00, daysToExpiry: 500, reorderLevel: 65 },
        { quantity: 280, unitPrice: 2.20, sellingPrice: 5.00, daysToExpiry: 460, reorderLevel: 50 },
        { quantity: 310, unitPrice: 3.50, sellingPrice: 7.50, daysToExpiry: 490, reorderLevel: 55 },
        { quantity: 200, unitPrice: 8.00, sellingPrice: 17.00, daysToExpiry: 300, reorderLevel: 40 },
        { quantity: 180, unitPrice: 10.50, sellingPrice: 22.00, daysToExpiry: 280, reorderLevel: 35 },
        { quantity: 95, unitPrice: 5.20, sellingPrice: 11.00, daysToExpiry: 55, reorderLevel: 22 },
        { quantity: 110, unitPrice: 6.50, sellingPrice: 14.00, daysToExpiry: 48, reorderLevel: 25 },
      ];

      for (let i = 0; i < medicineRecords.length; i++) {
        const medicine = medicineRecords[i];
        const supplier = supplierRecords[i % supplierRecords.length];
        const data = inventoryData[i % inventoryData.length];
        
        const manufacturingDate = new Date();
        manufacturingDate.setDate(manufacturingDate.getDate() - 180); // 6 months ago
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + data.daysToExpiry);
        
        // Get medicine ID - could be id or dataValues.id depending on sequelize version
        const medicineId = medicine.id || medicine.dataValues?.id || (medicine as any).get('id');
        
        if (!medicineId) {
          console.warn(`⚠️ Skipping inventory for medicine ${medicine.name} - no ID found`);
          continue;
        }
        
        await Inventory.findOrCreate({
          where: {
            batchNumber: `BATCH-${String(i + 1).padStart(4, '0')}`,
          },
          defaults: {
            medicineId: medicineId,
            batchNumber: `BATCH-${String(i + 1).padStart(4, '0')}`,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
            sellingPrice: data.sellingPrice,
            manufacturingDate: manufacturingDate,
            expiryDate: expiryDate,
            reorderLevel: data.reorderLevel,
            supplierName: supplier.companyName,
          } as any,
        });
      }
      console.log(`✅ Inventory items created (${medicineRecords.length})\n`);
    }

    // ============================================
    // PRESCRIPTIONS - Sample prescriptions
    // ============================================
    console.log('📋 Creating prescriptions...');
    
    const customerRecords = await Customer.findAll();
    const pharmacist = await User.findOne({ where: { role: 'staff' } });
    
    if (customerRecords.length > 0 && pharmacist && medicineRecords.length > 0) {
      const pharmacistId = pharmacist.id || pharmacist.dataValues?.id || (pharmacist as any).get('id');
      const customerId0 = customerRecords[0].id || customerRecords[0].dataValues?.id || (customerRecords[0] as any).get('id');
      const customerId1 = customerRecords[1].id || customerRecords[1].dataValues?.id || (customerRecords[1] as any).get('id');
      const customerId2 = customerRecords[2].id || customerRecords[2].dataValues?.id || (customerRecords[2] as any).get('id');
      const customerId3 = customerRecords[3].id || customerRecords[3].dataValues?.id || (customerRecords[3] as any).get('id');
      
      const prescriptions = [
        {
          customerId: customerId0,
          prescriptionNumber: `RX-${Date.now()}-001`,
          doctorName: 'Dr. Emily Roberts',
          doctorLicense: 'MD-12345',
          issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          medications: JSON.stringify([
            { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
            { name: 'Omeprazole 20mg', dosage: '20mg', frequency: 'Once daily before breakfast', duration: '14 days' },
          ]),
          diagnosis: 'Bacterial infection with gastritis',
          notes: 'Take antibiotics with food. Complete full course.',
          status: 'verified',
          verifiedBy: pharmacistId,
          verifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          isFilled: true,
        },
        {
          customerId: customerId1,
          prescriptionNumber: `RX-${Date.now()}-002`,
          doctorName: 'Dr. Michael Chang',
          doctorLicense: 'MD-67890',
          issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          medications: JSON.stringify([
            { name: 'Lisinopril 10mg', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
            { name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '30 days' },
          ]),
          diagnosis: 'Hypertension and hyperlipidemia',
          notes: 'Monitor blood pressure regularly',
          status: 'verified',
          verifiedBy: pharmacistId,
          verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isFilled: true,
        },
        {
          customerId: customerId2,
          prescriptionNumber: `RX-${Date.now()}-003`,
          doctorName: 'Dr. Sarah Williams',
          doctorLicense: 'MD-24680',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          medications: JSON.stringify([
            { name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily with meals', duration: '30 days' },
          ]),
          diagnosis: 'Type 2 Diabetes Mellitus',
          notes: 'Follow dietary guidelines. Regular exercise recommended.',
          status: 'pending',
          verifiedBy: null,
          verifiedAt: null,
          isFilled: false,
        },
        {
          customerId: customerId3,
          prescriptionNumber: `RX-${Date.now()}-004`,
          doctorName: 'Dr. James Wilson',
          doctorLicense: 'MD-13579',
          issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
          medications: JSON.stringify([
            { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: '2 puffs as needed', duration: '30 days' },
            { name: 'Montelukast 10mg', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '30 days' },
          ]),
          diagnosis: 'Asthma',
          notes: 'Use inhaler before exercise. Avoid triggers.',
          status: 'pending',
          verifiedBy: null,
          verifiedAt: null,
          isFilled: false,
        },
      ];

      for (const prescription of prescriptions) {
        await Prescription.create(prescription as any);
      }
      console.log(`✅ Prescriptions created (${prescriptions.length})\n`);
    }

    // ============================================
    // SALES - Transaction history for analytics
    // ============================================
    console.log('💰 Creating sales transactions...');
    
    const cashier = await User.findOne({ where: { role: 'staff' } });
    
    if (customerRecords.length > 0 && cashier && medicineRecords.length >= 10) {
      const cashierId = cashier.id || cashier.dataValues?.id || (cashier as any).get('id');
      const getMedicineId = (medicine: any) => medicine.id || medicine.dataValues?.id || medicine.get?.('id');
      const getCustomerId = (customer: any) => customer.id || customer.dataValues?.id || customer.get?.('id');
      
      const sales = [
        // Today's sales
        {
          customerId: getCustomerId(customerRecords[0]),
          saleDate: new Date(),
          totalAmount: 45.50,
          paymentMethod: 'cash',
          items: JSON.stringify([
            { medicineId: getMedicineId(medicineRecords[0]), name: medicineRecords[0].name, quantity: 2, price: 5.00, subtotal: 10.00 },
            { medicineId: getMedicineId(medicineRecords[17]), name: medicineRecords[17].name, quantity: 3, price: 6.50, subtotal: 19.50 },
            { medicineId: getMedicineId(medicineRecords[22]), name: medicineRecords[22].name, quantity: 4, price: 4.00, subtotal: 16.00 },
          ]),
          status: 'completed',
          processedBy: cashierId,
        },
        {
          customerId: getCustomerId(customerRecords[1]),
          saleDate: new Date(),
          totalAmount: 128.00,
          paymentMethod: 'card',
          items: JSON.stringify([
            { medicineId: getMedicineId(medicineRecords[8]), name: medicineRecords[8].name, quantity: 2, price: 18.00, subtotal: 36.00 },
            { medicineId: getMedicineId(medicineRecords[9]), name: medicineRecords[9].name, quantity: 3, price: 14.50, subtotal: 43.50 },
            { medicineId: getMedicineId(medicineRecords[12]), name: medicineRecords[12].name, quantity: 4, price: 12.00, subtotal: 48.50 },
          ]),
          status: 'completed',
          processedBy: cashierId,
        },
        
        // Yesterday's sales
        {
          customerId: getCustomerId(customerRecords[2]),
          saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          totalAmount: 32.00,
          paymentMethod: 'upi',
          items: JSON.stringify([
            { medicineId: getMedicineId(medicineRecords[1]), name: medicineRecords[1].name, quantity: 3, price: 6.50, subtotal: 19.50 },
            { medicineId: getMedicineId(medicineRecords[16]), name: medicineRecords[16].name, quantity: 2, price: 6.25, subtotal: 12.50 },
          ]),
          status: 'completed',
          processedBy: cashierId,
        },
        {
          customerId: getCustomerId(customerRecords[3]),
          saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          totalAmount: 85.00,
          paymentMethod: 'cash',
          items: JSON.stringify([
            { medicineId: getMedicineId(medicineRecords[4]), name: medicineRecords[4].name, quantity: 2, price: 25.00, subtotal: 50.00 },
            { medicineId: getMedicineId(medicineRecords[14]), name: medicineRecords[14].name, quantity: 3, price: 11.67, subtotal: 35.00 },
          ]),
          status: 'completed',
          processedBy: cashierId,
        },
        
        // Last week's sales
        {
          customerId: customerRecords[4].id,
          saleDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          totalAmount: 156.50,
          paymentMethod: 'card',
          items: JSON.stringify([
            { medicineId: medicineRecords[5].id, name: medicineRecords[5].name, quantity: 1, price: 42.00, subtotal: 42.00 },
            { medicineId: medicineRecords[6].id, name: medicineRecords[6].name, quantity: 2, price: 38.00, subtotal: 76.00 },
            { medicineId: medicineRecords[15].id, name: medicineRecords[15].name, quantity: 3, price: 12.83, subtotal: 38.50 },
          ]),
          status: 'completed',
          processedBy: cashier.id,
        },
        {
          customerId: customerRecords[5].id,
          saleDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          totalAmount: 67.00,
          paymentMethod: 'upi',
          items: JSON.stringify([
            { medicineId: medicineRecords[18].id, name: medicineRecords[18].name, quantity: 5, price: 9.00, subtotal: 45.00 },
            { medicineId: medicineRecords[23].id, name: medicineRecords[23].name, quantity: 2, price: 11.00, subtotal: 22.00 },
          ]),
          status: 'completed',
          processedBy: cashier.id,
        },
        
        // Last month's sales
        {
          customerId: customerRecords[6].id,
          saleDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          totalAmount: 92.50,
          paymentMethod: 'cash',
          items: JSON.stringify([
            { medicineId: medicineRecords[7].id, name: medicineRecords[7].name, quantity: 2, price: 32.00, subtotal: 64.00 },
            { medicineId: medicineRecords[19].id, name: medicineRecords[19].name, quantity: 3, price: 9.50, subtotal: 28.50 },
          ]),
          status: 'completed',
          processedBy: cashier.id,
        },
        {
          customerId: customerRecords[7].id,
          saleDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          totalAmount: 145.00,
          paymentMethod: 'card',
          items: JSON.stringify([
            { medicineId: medicineRecords[10].id, name: medicineRecords[10].name, quantity: 3, price: 25.00, subtotal: 75.00 },
            { medicineId: medicineRecords[11].id, name: medicineRecords[11].name, quantity: 2, price: 20.00, subtotal: 40.00 },
            { medicineId: medicineRecords[22].id, name: medicineRecords[22].name, quantity: 5, price: 6.00, subtotal: 30.00 },
          ]),
          status: 'completed',
          processedBy: cashier.id,
        },
      ];

      for (const sale of sales) {
        await Sale.create(sale as any);
      }
      console.log(`✅ Sales transactions created (${sales.length})\n`);
    }

    // ============================================
    // PURCHASE ORDERS - For supplier management
    // ============================================
    console.log('📝 Creating purchase orders...');
    
    if (supplierRecords.length > 0 && medicineRecords.length >= 5) {
      const purchaseOrders = [
        {
          orderNumber: `PO-${Date.now()}-001`,
          supplierId: supplierRecords[0].id,
          orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          expectedDeliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          actualDeliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          items: JSON.stringify([
            { medicineId: medicineRecords[0].id, name: medicineRecords[0].name, quantity: 500, unitPrice: 2.50, total: 1250.00 },
            { medicineId: medicineRecords[1].id, name: medicineRecords[1].name, quantity: 300, unitPrice: 3.00, total: 900.00 },
          ]),
          totalAmount: 2150.00,
          status: 'received',
          notes: 'Delivered on time',
        },
        {
          orderNumber: `PO-${Date.now()}-002`,
          supplierId: supplierRecords[1].id,
          orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          actualDeliveryDate: null,
          items: JSON.stringify([
            { medicineId: medicineRecords[4].id, name: medicineRecords[4].name, quantity: 200, unitPrice: 12.00, total: 2400.00 },
            { medicineId: medicineRecords[5].id, name: medicineRecords[5].name, quantity: 150, unitPrice: 20.00, total: 3000.00 },
          ]),
          totalAmount: 5400.00,
          status: 'pending',
          notes: 'Rush order for low stock items',
        },
        {
          orderNumber: `PO-${Date.now()}-003`,
          supplierId: supplierRecords[2].id,
          orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          expectedDeliveryDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          actualDeliveryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          items: JSON.stringify([
            { medicineId: medicineRecords[8].id, name: medicineRecords[8].name, quantity: 250, unitPrice: 8.50, total: 2125.00 },
            { medicineId: medicineRecords[12].id, name: medicineRecords[12].name, quantity: 400, unitPrice: 5.50, total: 2200.00 },
          ]),
          totalAmount: 4325.00,
          status: 'received',
          notes: 'Good quality products',
        },
      ];

      for (const order of purchaseOrders) {
        await PurchaseOrder.create(order as any);
      }
      console.log(`✅ Purchase orders created (${purchaseOrders.length})\n`);
    }

    console.log('🎉 DEMO DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('=' .repeat(60));
    console.log('📊 DEMO DATA SUMMARY');
    console.log('=' .repeat(60));
    console.log('👥 Users: 3 (Admin, Pharmacist, Cashier)');
    console.log('🏢 Suppliers: 3');
    console.log('💊 Medicines: 30 (covering 10+ categories)');
    console.log('👤 Customers: 8');
    console.log('📦 Inventory Items: 30 (various stock levels)');
    console.log('📋 Prescriptions: 4 (2 verified, 2 pending)');
    console.log('💰 Sales: 8 transactions');
    console.log('📝 Purchase Orders: 3 (2 received, 1 pending)');
    console.log('=' .repeat(60));
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('-' .repeat(60));
    console.log('Admin:      admin@pharmacy.com / admin123');
    console.log('Pharmacist: pharmacist@pharmacy.com / pharmacist123');
    console.log('Cashier:    cashier@pharmacy.com / cashier123');
    console.log('=' .repeat(60));
    console.log('\n💡 DEMO HIGHLIGHTS:');
    console.log('✓ Low stock items (8-25 units) - for demand prediction demo');
    console.log('✓ Expiring items (38-55 days) - for inventory alerts demo');
    console.log('✓ Pending prescriptions - for OCR scanner demo');
    console.log('✓ Various drug combinations - for interaction checker demo');
    console.log('✓ Diverse sales data - for analytics dashboard demo');
    console.log('✓ Customer profiles - for chatbot personalization demo');
    console.log('=' .repeat(60));
    console.log('\n✅ Ready for demo presentation!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ DEMO SEED FAILED:', error);
    process.exit(1);
  }
};

demoSeed();
