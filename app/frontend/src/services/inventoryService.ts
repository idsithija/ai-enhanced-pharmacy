import api from './api';
import type { ApiResponse, PaginatedResponse, InventoryItem } from '../types';

export const inventoryService = {
  // Get all inventory items with pagination
  getInventory: async (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    const response = await api.get<PaginatedResponse<InventoryItem>>(`/inventory?${params}`);
    return response.data;
  },

  // Get single inventory item
  getInventoryItem: async (id: string): Promise<InventoryItem> => {
    const response = await api.get<ApiResponse<InventoryItem>>(`/inventory/${id}`);
    return response.data.data;
  },

  // Add stock
  addStock: async (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> => {
    const response = await api.post<ApiResponse<InventoryItem>>('/inventory', data);
    return response.data.data;
  },

  // Update stock
  updateStock: async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data);
    return response.data.data;
  },

  // Delete stock
  deleteStock: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },

  // Get expiring items
  getExpiringItems: async (days: number = 90): Promise<InventoryItem[]> => {
    const response = await api.get<ApiResponse<InventoryItem[]>>(`/inventory/expiring?days=${days}`);
    return response.data.data;
  },

  // Get low stock items
  getLowStock: async (): Promise<InventoryItem[]> => {
    const response = await api.get<ApiResponse<InventoryItem[]>>('/inventory/low-stock');
    return response.data.data;
  },
};
