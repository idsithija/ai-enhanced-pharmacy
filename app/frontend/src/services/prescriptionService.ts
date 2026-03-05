import api from './api';
import type { ApiResponse, Prescription } from '../types';

export interface PrescriptionRequest {
  customerId: string;
  customerName: string;
  customerPhone: string;
  doctorName: string;
  doctorLicense: string;
  medicines: {
    medicineId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
  notes?: string;
  imageUrl?: string;
}

export interface VerifyPrescriptionRequest {
  verifiedBy: string;
  verificationNotes?: string;
}

export interface DispensePrescriptionRequest {
  dispensedBy: string;
  dispensedNotes?: string;
}

export const prescriptionService = {
  // Get all prescriptions
  getPrescriptions: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append('status', status);
    }
    const response = await api.get(`/prescriptions?${params}`);
    return response.data;
  },

  // Get single prescription
  getPrescription: async (id: string): Promise<Prescription> => {
    const response = await api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`);
    return response.data.data;
  },

  // Create prescription
  createPrescription: async (data: PrescriptionRequest): Promise<Prescription> => {
    const response = await api.post<ApiResponse<Prescription>>('/prescriptions', data);
    return response.data.data;
  },

  // Update prescription
  updatePrescription: async (id: string, data: Partial<PrescriptionRequest>): Promise<Prescription> => {
    const response = await api.put<ApiResponse<Prescription>>(`/prescriptions/${id}`, data);
    return response.data.data;
  },

  // Verify prescription
  verifyPrescription: async (id: string, data: VerifyPrescriptionRequest): Promise<Prescription> => {
    const response = await api.post<ApiResponse<Prescription>>(`/prescriptions/${id}/verify`, data);
    return response.data.data;
  },

  // Dispense prescription
  dispensePrescription: async (id: string, data: DispensePrescriptionRequest): Promise<Prescription> => {
    const response = await api.post<ApiResponse<Prescription>>(`/prescriptions/${id}/dispense`, data);
    return response.data.data;
  },

  // Upload prescription image
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<ApiResponse<{ url: string }>>('/prescriptions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.url;
  },

  // Search prescriptions
  searchPrescriptions: async (query: string) => {
    const response = await api.get(`/prescriptions/search?q=${query}`);
    return response.data;
  },
};
