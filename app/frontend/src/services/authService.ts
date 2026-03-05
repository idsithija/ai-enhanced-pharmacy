import api from './api';
import type { LoginCredentials, AuthResponse, User, ApiResponse } from '../types';

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  // Register
  register: async (userData: Partial<User> & { password: string }): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  },

  // Update profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', userData);
    return response.data.data;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { oldPassword, newPassword });
  },
};
