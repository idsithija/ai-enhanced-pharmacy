import api from './api';
import type { ApiResponse, PaginatedResponse, Medicine } from '../types';

export const medicineService = {
  // Get all medicines with pagination and search
  getMedicines: async (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    const response = await api.get<PaginatedResponse<Medicine>>(`/medicines?${params}`);
    return response.data;
  },

  // Get single medicine by ID
  getMedicine: async (id: string): Promise<Medicine> => {
    const response = await api.get<ApiResponse<Medicine>>(`/medicines/${id}`);
    return response.data.data;
  },

  // Create new medicine
  createMedicine: async (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> => {
    const response = await api.post<ApiResponse<Medicine>>('/medicines', data);
    return response.data.data;
  },

  // Update medicine
  updateMedicine: async (id: string, data: Partial<Medicine>): Promise<Medicine> => {
    const response = await api.put<ApiResponse<Medicine>>(`/medicines/${id}`, data);
    return response.data.data;
  },

  // Delete medicine
  deleteMedicine: async (id: string): Promise<void> => {
    await api.delete(`/medicines/${id}`);
  },

  // Search medicines
  searchMedicines: async (query: string): Promise<Medicine[]> => {
    const response = await api.get<ApiResponse<Medicine[]>>(`/medicines/search?q=${query}`);
    return response.data.data;
  },
};
