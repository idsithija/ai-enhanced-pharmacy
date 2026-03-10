import api from './api';
import type { ApiResponse, Sale, Customer } from '../types';

export interface CartItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  inventoryId: string;
  batchNumber: string;
}

export interface SaleRequest {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  prescriptionId?: number;
  items: {
    medicineId: string;
    inventoryId: string;
    quantity: number;
    unitPrice: number;
  }[];
  paymentMethod: 'cash' | 'card' | 'mobile';
  discount?: number;
}

export const saleService = {
  // Create new sale
  createSale: async (data: SaleRequest): Promise<Sale> => {
    const response = await api.post<ApiResponse<Sale>>('/sales', data);
    return response.data.data?.sale || response.data.data;
  },

  // Get sale by ID
  getSale: async (id: string): Promise<Sale> => {
    const response = await api.get<ApiResponse<Sale>>(`/sales/${id}`);
    return response.data.data?.sale || response.data.data;
  },

  // Get all sales
  getSales: async (page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/sales?${params}`);
    return response.data;
  },

  // Search customer by phone
  searchCustomerByPhone: async (phone: string): Promise<Customer | null> => {
    try {
      const response = await api.get(`/customers/phone/${phone}`);
      return response.data.data?.customer || response.data.data;
    } catch (error) {
      return null;
    }
  },

  // Create quick customer
  createQuickCustomer: async (data: { firstName: string; lastName: string; phoneNumber: string }): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data.data?.customer || response.data.data;
  },
};
