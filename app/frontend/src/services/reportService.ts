import api from './api';
import type { ApiResponse } from '../types';

export interface SalesReport {
  period: string;
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  topSellingMedicines: {
    medicineId: string;
    medicineName: string;
    quantitySold: number;
    revenue: number;
  }[];
}

export interface InventoryReport {
  totalProducts: number;
  lowStockCount: number;
  expiringCount: number;
  totalValue: number;
  categoryBreakdown: {
    category: string;
    count: number;
    value: number;
  }[];
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomers: number;
  vipCustomers: number;
  averageLifetimeValue: number;
  loyaltyPointsIssued: number;
}

export interface FinancialReport {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  paymentMethodBreakdown: {
    method: string;
    amount: number;
    percentage: number;
  }[];
}

export const reportService = {
  // Get sales report
  getSalesReport: async (startDate: string, endDate: string): Promise<SalesReport> => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await api.get<ApiResponse<SalesReport>>(`/reports/sales?${params}`);
    return response.data.data;
  },

  // Get inventory report
  getInventoryReport: async (): Promise<InventoryReport> => {
    const response = await api.get<ApiResponse<InventoryReport>>('/reports/inventory');
    return response.data.data;
  },

  // Get customer report
  getCustomerReport: async (startDate: string, endDate: string): Promise<CustomerReport> => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await api.get<ApiResponse<CustomerReport>>(`/reports/customers?${params}`);
    return response.data.data;
  },

  // Get financial report
  getFinancialReport: async (startDate: string, endDate: string): Promise<FinancialReport> => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await api.get<ApiResponse<FinancialReport>>(`/reports/financial?${params}`);
    return response.data.data;
  },

  // Export report as CSV
  exportReport: async (type: string, startDate: string, endDate: string): Promise<Blob> => {
    const params = new URLSearchParams({ type, startDate, endDate });
    const response = await api.get(`/reports/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get daily sales trend
  getDailySalesTrend: async (days: number = 30) => {
    const response = await api.get(`/reports/sales/trend?days=${days}`);
    return response.data;
  },

  // Get category-wise sales
  getCategorySales: async (startDate: string, endDate: string) => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await api.get(`/reports/sales/category?${params}`);
    return response.data;
  },
};
