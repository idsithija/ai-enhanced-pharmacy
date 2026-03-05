import { User, Medicine, Inventory, Customer, Supplier } from '../models/index.js';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user if not exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@pharmacy.com' } });
    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@pharmacy.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phoneNumber: '9876543210',
        isActive: true,
      });
    }

    // Create pharmacist user if not exists
    const existingPharmacist = await User.findOne({ where: { email: 'pharmacist@pharmacy.com' } });
    if (!existingPharmacist) {
      await User.create({
        username: 'pharmacist',
        email: 'pharmacist@pharmacy.com',
        password: 'pharmacist123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'pharmacist',
        phoneNumber: '9876543211',
        isActive: true,
      });
    }

    // Create cashier user if not exists
    const existingCashier = await User.findOne({ where: { email: 'cashier@pharmacy.com' } });
    if (!existingCashier) {
      await User.create({
        username: 'cashier',
        email: 'cashier@pharmacy.com',
        password: 'cashier123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'cashier',
        phoneNumber: '9876543212',
        isActive: true,
      });
    }

    console.log('✅ Users created');

    // Create sample medicines
    const medicines = [
      {
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        brandName: 'Tylenol',
        category: 'Analgesic',
        dosageForm: 'Tablet',
        strength: '500mg',
        manufacturer: 'PharmaCorp',
        requiresPrescription: false,
        isControlledSubstance: false,
        isActive: true,
      },
      {
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        brandName: 'Amoxil',
        category: 'Antibiotic',
        dosageForm: 'Capsule',
        strength: '250mg',
        manufacturer: 'MediPharm',
        requiresPrescription: true,
        isControlledSubstance: false,
        isActive: true,
      },
      {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        brandName: 'Advil',
        category: 'NSAID',
        dosageForm: 'Tablet',
        strength: '400mg',
        manufacturer: 'HealthPlus',
        requiresPrescription: false,
        isControlledSubstance: false,
        isActive: true,
      },
      {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine HCl',
        brandName: 'Zyrtec',
        category: 'Antihistamine',
        dosageForm: 'Tablet',
        strength: '10mg',
        manufacturer: 'AllergyRelief',
        requiresPrescription: false,
        isControlledSubstance: false,
        isActive: true,
      },
      {
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        brandName: 'Prilosec',
        category: 'PPI',
        dosageForm: 'Capsule',
        strength: '20mg',
        manufacturer: 'PharmaCorp',
        requiresPrescription: true,
        isControlledSubstance: false,
        isActive: true,
      },
    ];

    for (const medicine of medicines) {
      const existing = await Medicine.findOne({ where: { name: medicine.name } });
      if (!existing) {
        await Medicine.create(medicine as any);
      }
    }

    console.log('✅ Medicines created');

    // Create sample customers
    const customers = [
      {
        firstName: 'John',
        lastName: 'Customer',
        phoneNumber: '9876543210',
        email: 'john@example.com',
        address: '123 Main St, Springfield',
        dateOfBirth: new Date('1985-06-15'),
        loyaltyPoints: 450,
        isActive: true,
      },
      {
        firstName: 'Jane',
        lastName: 'Customer',
        phoneNumber: '9876543211',
        email: 'jane@example.com',
        address: '456 Oak Ave, Springfield',
        dateOfBirth: new Date('1990-03-22'),
        loyaltyPoints: 1250,
        isActive: true,
      },
    ];

    for (const customer of customers) {
      const existing = await Customer.findOne({ where: { phoneNumber: customer.phoneNumber } });
      if (!existing) {
        await Customer.create(customer as any);
      }
    }

    console.log('✅ Customers created');

    // Create sample suppliers
    const suppliers = [
      {
        companyName: 'PharmaCorp Suppliers',
        contactPerson: 'Robert Wilson',
        email: 'robert@pharmacorp.com',
        phoneNumber: '1234567890',
        address: '789 Industrial Blvd',
        city: 'Medical City',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        rating: 4.5,
        isActive: true,
      },
      {
        companyName: 'MediSupply Inc',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@medisupply.com',
        phoneNumber: '1234567891',
        address: '456 Supply St',
        city: 'Healthcare Town',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        rating: 4.8,
        isActive: true,
      },
    ];

    for (const supplier of suppliers) {
      const existing = await Supplier.findOne({ where: { email: supplier.email } });
      if (!existing) {
        await Supplier.create(supplier as any);
      }
    }

    console.log('✅ Suppliers created');

    // Create sample inventory
    const medicineRecords = await Medicine.findAll({ raw: true });
    const supplierRecords = await Supplier.findAll({ raw: true });

    if (medicineRecords.length > 0 && supplierRecords.length > 0) {
      for (let i = 0; i < Math.min(3, medicineRecords.length); i++) {
        const medicine = medicineRecords[i];
        const supplier = supplierRecords[i % supplierRecords.length];
        
        const existing = await Inventory.findOne({
          where: {
            medicineId: medicine.id,
            batchNumber: `BATCH00${i + 1}`,
          },
        });
        
        if (!existing) {
          await Inventory.create({
            medicineId: medicine.id,
            batchNumber: `BATCH00${i + 1}`,
            quantity: 100 + i * 50,
            unitPrice: 5.0 + i * 2,
            sellingPrice: 10.0 + i * 3,
            manufacturingDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            reorderLevel: 20,
            supplierName: supplier.companyName,
          } as any);
        }
      }
      console.log('✅ Inventory created');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@pharmacy.com / admin123');
    console.log('Pharmacist: pharmacist@pharmacy.com / pharmacist123');
    console.log('Cashier: cashier@pharmacy.com / cashier123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};
