import api from './api';
import type { ApiResponse, DashboardStats, Sale, Notification } from '../types';

export interface LowStockItem {
  id: string;
  medicineName: string;
  quantity: number;
  batchNumber: string;
}

export interface ExpiringItem {
  id: string;
  medicineName: string;
  expiryDate: string;
  quantity: number;
  batchNumber: string;
}

export const dashboardService = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data;
  },

  // Get recent sales
  getRecentSales: async (limit: number = 5): Promise<Sale[]> => {
    const response = await api.get<ApiResponse<Sale[]>>(`/dashboard/recent-sales?limit=${limit}`);
    return response.data.data;
  },

  // Get low stock items
  getLowStock: async (): Promise<LowStockItem[]> => {
    const response = await api.get<ApiResponse<LowStockItem[]>>('/dashboard/low-stock');
    return response.data.data;
  },

  // Get expiring items
  getExpiringItems: async (): Promise<ExpiringItem[]> => {
    const response = await api.get<ApiResponse<ExpiringItem[]>>('/dashboard/expiring-items');
    return response.data.data;
  },

  // Get notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data.data;
  },
};
