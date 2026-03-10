import api from './api';

export interface PrescriptionRequest {
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  doctorName?: string;
  doctorLicense?: string;
  hospitalName?: string;
  ocrConfidence?: number;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
  prescriptionDate?: string;
  notes?: string;
  imageUrl?: string;
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
    return response.data.data;
  },

  // Get current user's prescriptions
  getMyPrescriptions: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append('status', status);
    }
    const response = await api.get(`/prescriptions/my?${params}`);
    return response.data;
  },

  // Get single prescription
  getPrescription: async (id: string) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data.data?.prescription || response.data.data;
  },

  // Create prescription
  createPrescription: async (data: PrescriptionRequest) => {
    const response = await api.post('/prescriptions', data);
    return response.data.data?.prescription || response.data.data;
  },

  // Update prescription
  updatePrescription: async (id: string, data: Partial<PrescriptionRequest>) => {
    const response = await api.put(`/prescriptions/${id}`, data);
    return response.data.data?.prescription || response.data.data;
  },

  // Verify prescription
  verifyPrescription: async (id: string) => {
    const response = await api.put(`/prescriptions/${id}/verify`);
    return response.data.data?.prescription || response.data.data;
  },

  // Reject prescription
  rejectPrescription: async (id: string, notes?: string) => {
    const response = await api.put(`/prescriptions/${id}/reject`, { notes });
    return response.data.data?.prescription || response.data.data;
  },

  // Dispense prescription
  dispensePrescription: async (id: string, notes?: string) => {
    const response = await api.put(`/prescriptions/${id}/dispense`, { notes });
    return response.data.data?.prescription || response.data.data;
  },

  // Upload prescription image only (returns URL)
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/prescriptions/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.url;
  },

  // Upload prescription image with patient details (FormData)
  createPrescriptionWithImage: async (formData: FormData) => {
    const response = await api.post('/prescriptions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Search prescriptions
  searchPrescriptions: async (query: string) => {
    const response = await api.get(`/prescriptions/search?q=${query}`);
    return response.data;
  },
};
