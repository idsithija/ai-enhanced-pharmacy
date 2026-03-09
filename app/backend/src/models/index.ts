// Central export point for all models
import User from './User.js';
import Medicine from './Medicine.js';
import Inventory from './Inventory.js';
import Prescription from './Prescription.js';
import Sale from './Sale.js';
import Customer from './Customer.js';
import Supplier from './Supplier.js';
import PurchaseOrder from './PurchaseOrder.js';
import Notification from './Notification.js';

// Define model associations
// PurchaseOrder belongs to Supplier
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', as: 'purchaseOrders' });

// PurchaseOrder belongs to Users (creator, approver, receiver)
PurchaseOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
PurchaseOrder.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
PurchaseOrder.belongsTo(User, { foreignKey: 'receivedBy', as: 'receiver' });

// Inventory belongs to Medicine
Inventory.belongsTo(Medicine, { foreignKey: 'medicineId', as: 'medicine' });
Medicine.hasMany(Inventory, { foreignKey: 'medicineId', as: 'inventory' });

// Sale belongs to User (cashier) and Customer
Sale.belongsTo(User, { foreignKey: 'cashierId', as: 'cashier' });
User.hasMany(Sale, { foreignKey: 'cashierId', as: 'userSales' });
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });

// Sale belongs to Prescription
Sale.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
Prescription.hasMany(Sale, { foreignKey: 'prescriptionId', as: 'prescriptionSales' });

// Prescription belongs to User (verified by)
Prescription.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifiedByUser' });
User.hasMany(Prescription, { foreignKey: 'verifiedBy', as: 'verifiedPrescriptions' });

// Prescription belongs to User (created by)
Prescription.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
User.hasMany(Prescription, { foreignKey: 'createdBy', as: 'createdPrescriptions' });

// Notification belongs to User
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// Export all models
export { User, Medicine, Inventory, Prescription, Sale, Customer, Supplier, PurchaseOrder, Notification };

// Export a function to sync all models
export const syncModels = async (options?: { force?: boolean; alter?: boolean }): Promise<void> => {
  try {
    await User.sync(options);
    await Medicine.sync(options);
    await Inventory.sync(options);
    await Prescription.sync(options);
    await Sale.sync(options);
    await Customer.sync(options);
    await Supplier.sync(options);
    await PurchaseOrder.sync(options);
    await Notification.sync(options);
    console.log('✅ All models synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
    throw error;
  }
};
