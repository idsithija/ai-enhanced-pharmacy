// User & Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'pharmacist' | 'cashier' | 'customer';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Medicine Types
export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  description?: string;
  unitPrice: number;
  requiresPrescription: boolean;
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  medicineId: string;
  medicine?: Medicine;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  supplierId: string;
  supplier?: Supplier;
  createdAt: string;
  updatedAt: string;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Prescription Types
export interface Prescription {
  id: string;
  customerId: string;
  customer?: Customer;
  doctorName: string;
  prescriptionDate: string;
  imageUrl?: string;
  extractedText?: string;
  status: 'uploaded' | 'processing' | 'pending' | 'verified' | 'dispensed' | 'rejected';
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Sale Types
export interface Sale {
  id: string;
  customerId?: string;
  customer?: Customer;
  userId: string;
  user?: User;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  medicineId: string;
  medicine?: Medicine;
  inventoryId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  todaySales: number;
  todayRevenue: number;
  totalSalesToday: number;
  totalTransactions: number;
  lowStockCount: number;
  expiringCount: number;
  expiringSoonCount: number;
  pendingPrescriptions: number;
  totalMedicines: number;
  totalUsers: number;
  recentSales: Sale[];
  topSellingMedicines: {
    medicine: Medicine;
    totalSold: number;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
