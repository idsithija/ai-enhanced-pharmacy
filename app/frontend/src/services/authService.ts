import api from './api';
import type { LoginCredentials, AuthResponse, User, ApiResponse } from '../types';

interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  // Register (public - creates 'user' role)
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data;
  },

  // Register staff (admin only)
  registerStaff: async (userData: RegisterData): Promise<{ user: User }> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/register-staff', userData);
    return response.data.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  },

  // Update profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/auth/profile', userData);
    return response.data.data.user;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { oldPassword, newPassword });
  },
};
