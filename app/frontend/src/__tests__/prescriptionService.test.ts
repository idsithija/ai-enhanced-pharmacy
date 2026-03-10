import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock the auth store before importing the module
vi.mock('../store/authStore', () => ({
  useAuthStore: {
    getState: () => ({ token: 'test-token' }),
  },
}));

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      ...mockAxiosInstance,
    },
  };
});

// Get the mocked api instance
let prescriptionService: typeof import('../services/prescriptionService')['prescriptionService'];
let api: any;

beforeEach(async () => {
  vi.clearAllMocks();
  // Dynamic import to get fresh module
  const apiModule = await import('../services/api');
  api = apiModule.default;
  const mod = await import('../services/prescriptionService');
  prescriptionService = mod.prescriptionService;
});

describe('Prescription Service', () => {
  describe('getPrescriptions', () => {
    it('should fetch prescriptions with default pagination', async () => {
      api.get.mockResolvedValue({
        data: {
          data: {
            prescriptions: [{ id: 1 }],
            pagination: { total: 1, page: 1, pages: 1 },
          },
        },
      });

      const result = await prescriptionService.getPrescriptions();

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/prescriptions?'));
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=1'));
      expect(result).toEqual({
        prescriptions: [{ id: 1 }],
        pagination: { total: 1, page: 1, pages: 1 },
      });
    });

    it('should include status filter when provided', async () => {
      api.get.mockResolvedValue({ data: { data: { prescriptions: [], pagination: {} } } });

      await prescriptionService.getPrescriptions(1, 10, 'pending');

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('status=pending'));
    });
  });

  describe('getPrescription', () => {
    it('should fetch a single prescription by ID', async () => {
      const prescription = { id: 5, patientName: 'John' };
      api.get.mockResolvedValue({ data: { data: { prescription } } });

      const result = await prescriptionService.getPrescription('5');

      expect(api.get).toHaveBeenCalledWith('/prescriptions/5');
      expect(result).toEqual(prescription);
    });
  });

  describe('createPrescription', () => {
    it('should create a prescription via POST', async () => {
      const data = {
        patientName: 'John Doe',
        patientPhone: '0771234567',
        medications: [{ name: 'Paracetamol', dosage: '500mg', frequency: '3x', duration: '5d', quantity: 15 }],
      };
      const created = { id: 1, ...data };
      api.post.mockResolvedValue({ data: { data: { prescription: created } } });

      const result = await prescriptionService.createPrescription(data);

      expect(api.post).toHaveBeenCalledWith('/prescriptions', data);
      expect(result).toEqual(created);
    });

    it('should allow creating without optional fields (doctorName, hospitalName)', async () => {
      const data = {
        patientName: 'Jane',
        patientPhone: '0779999999',
        medications: [],
      };
      api.post.mockResolvedValue({ data: { data: { prescription: { id: 2, ...data } } } });

      const result = await prescriptionService.createPrescription(data);

      expect(api.post).toHaveBeenCalledWith('/prescriptions', data);
      expect(result.patientName).toBe('Jane');
    });
  });

  describe('updatePrescription', () => {
    it('should update a prescription via PUT', async () => {
      const updated = { id: 1, patientName: 'Updated' };
      api.put.mockResolvedValue({ data: { data: { prescription: updated } } });

      const result = await prescriptionService.updatePrescription('1', { patientName: 'Updated' });

      expect(api.put).toHaveBeenCalledWith('/prescriptions/1', { patientName: 'Updated' });
      expect(result).toEqual(updated);
    });
  });

  describe('verifyPrescription', () => {
    it('should call verify endpoint', async () => {
      api.put.mockResolvedValue({ data: { data: { prescription: { id: 1, status: 'verified' } } } });

      const result = await prescriptionService.verifyPrescription('1');

      expect(api.put).toHaveBeenCalledWith('/prescriptions/1/verify');
      expect(result.status).toBe('verified');
    });
  });

  describe('rejectPrescription', () => {
    it('should call reject endpoint with notes', async () => {
      api.put.mockResolvedValue({ data: { data: { prescription: { id: 1, status: 'rejected' } } } });

      const result = await prescriptionService.rejectPrescription('1', 'Invalid');

      expect(api.put).toHaveBeenCalledWith('/prescriptions/1/reject', { notes: 'Invalid' });
      expect(result.status).toBe('rejected');
    });
  });

  describe('dispensePrescription', () => {
    it('should call dispense endpoint', async () => {
      api.put.mockResolvedValue({ data: { data: { prescription: { id: 1, status: 'dispensed' } } } });

      const result = await prescriptionService.dispensePrescription('1');

      expect(api.put).toHaveBeenCalledWith('/prescriptions/1/dispense', { notes: undefined });
      expect(result.status).toBe('dispensed');
    });
  });

  describe('uploadImage', () => {
    it('should upload an image file and return URL', async () => {
      api.post.mockResolvedValue({ data: { data: { url: '/uploads/prescriptions/rx-123.jpg' } } });

      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
      const result = await prescriptionService.uploadImage(file);

      expect(api.post).toHaveBeenCalledWith(
        '/prescriptions/upload-image',
        expect.any(FormData),
        expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
      );
      expect(result).toBe('/uploads/prescriptions/rx-123.jpg');
    });
  });
});
