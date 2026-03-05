import api from './api';
import type { ApiResponse, Customer } from '../types';

export interface CustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
}

export interface PurchaseHistory {
  id: string;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
  pointsEarned: number;
}

export const customerService = {
  // Get all customers
  getCustomers: async (page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/customers?${params}`);
    return response.data;
  },

  // Get single customer
  getCustomer: async (id: string): Promise<Customer> => {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  // Create customer
  createCustomer: async (data: CustomerRequest): Promise<Customer> => {
    const response = await api.post<ApiResponse<Customer>>('/customers', data);
    return response.data.data;
  },

  // Update customer
  updateCustomer: async (id: string, data: Partial<CustomerRequest>): Promise<Customer> => {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data.data;
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  // Search customers
  searchCustomers: async (query: string) => {
    const response = await api.get(`/customers/search?q=${query}`);
    return response.data;
  },

  // Get customer purchase history
  getPurchaseHistory: async (customerId: string): Promise<PurchaseHistory[]> => {
    const response = await api.get<ApiResponse<PurchaseHistory[]>>(`/customers/${customerId}/purchases`);
    return response.data.data;
  },

  // Add loyalty points
  addLoyaltyPoints: async (customerId: string, points: number): Promise<Customer> => {
    const response = await api.post<ApiResponse<Customer>>(`/customers/${customerId}/loyalty/add`, { points });
    return response.data.data;
  },

  // Redeem loyalty points
  redeemLoyaltyPoints: async (customerId: string, points: number): Promise<Customer> => {
    const response = await api.post<ApiResponse<Customer>>(`/customers/${customerId}/loyalty/redeem`, { points });
    return response.data.data;
  },

  // Get customer by phone
  getCustomerByPhone: async (phone: string): Promise<Customer | null> => {
    try {
      const response = await api.get<ApiResponse<Customer>>(`/customers/phone/${phone}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },
};
