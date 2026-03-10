import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';

// Mock multer before importing controller
jest.mock('multer', () => {
  const m = () => ({
    single: () => (_req: any, _res: any, next: any) => next(),
  });
  m.diskStorage = () => ({});
  return m;
});

// Mock models
const mockPrescription = {
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockUser = {};

jest.mock('../../models/index.js', () => ({
  Prescription: mockPrescription,
  User: mockUser,
}));

import {
  getPrescriptions,
  getMyPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  verifyPrescription,
  rejectPrescription,
  dispensePrescription,
} from '../../controllers/prescriptionController.js';

// Helper to create mock request/response
const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

describe('Prescription Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ────────────────────────── GET PRESCRIPTIONS ──────────────────────────
  describe('getPrescriptions', () => {
    it('should return paginated prescriptions for admin/staff', async () => {
      const prescriptions = [
        { id: 1, patientName: 'John Doe', status: 'pending' },
        { id: 2, patientName: 'Jane Smith', status: 'verified' },
      ];
      mockPrescription.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: prescriptions,
      });

      const req = {
        query: { page: '1', limit: '20' },
        user: { id: 1, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await getPrescriptions(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            prescriptions,
            pagination: { total: 2, page: 1, pages: 1 },
          }),
        })
      );
    });

    it('should filter prescriptions by status', async () => {
      mockPrescription.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const req = {
        query: { status: 'verified', page: '1', limit: '20' },
        user: { id: 1, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await getPrescriptions(req, res, mockNext);

      expect(mockPrescription.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'verified' }),
        })
      );
    });

    it('should restrict regular users to their own prescriptions', async () => {
      mockPrescription.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const req = {
        query: { page: '1', limit: '20' },
        user: { id: 5, role: 'user' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await getPrescriptions(req, res, mockNext);

      expect(mockPrescription.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ createdBy: 5 }),
        })
      );
    });

    it('should call next on error', async () => {
      const error = new Error('DB error');
      mockPrescription.findAndCountAll.mockRejectedValue(error);

      const req = {
        query: { page: '1', limit: '20' },
        user: { id: 1, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await getPrescriptions(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ────────────────────────── GET MY PRESCRIPTIONS ──────────────────────────
  describe('getMyPrescriptions', () => {
    it('should return only the current user prescriptions', async () => {
      const prescriptions = [{ id: 1, patientName: 'Self' }];
      mockPrescription.findAndCountAll.mockResolvedValue({ count: 1, rows: prescriptions });

      const req = {
        query: { page: '1', limit: '20' },
        user: { id: 3, role: 'user' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await getMyPrescriptions(req, res, mockNext);

      expect(mockPrescription.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ createdBy: 3 }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 401 if not authenticated', async () => {
      const req = {
        query: { page: '1', limit: '20' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await getMyPrescriptions(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // ────────────────────────── GET SINGLE PRESCRIPTION ──────────────────────────
  describe('getPrescription', () => {
    it('should return a prescription by ID', async () => {
      const prescription = { id: 1, patientName: 'John Doe', status: 'pending' };
      mockPrescription.findByPk.mockResolvedValue(prescription);

      const req = { params: { id: '1' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getPrescription(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { prescription },
      });
    });

    it('should return 404 if prescription not found', async () => {
      mockPrescription.findByPk.mockResolvedValue(null);

      const req = { params: { id: '999' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getPrescription(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Prescription not found' },
      });
    });
  });

  // ────────────────────────── CREATE PRESCRIPTION ──────────────────────────
  describe('createPrescription', () => {
    it('should create a prescription with auto-generated number', async () => {
      const created = { id: 1, prescriptionNumber: 'RX-123', patientName: 'John', status: 'pending' };
      mockPrescription.create.mockResolvedValue(created);

      const req = {
        body: {
          patientName: 'John',
          patientPhone: '0771234567',
          medications: [{ name: 'Paracetamol', dosage: '500mg', frequency: '3x daily', duration: '5 days', quantity: 15 }],
        },
        user: { id: 1, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await createPrescription(req, res, mockNext);

      expect(mockPrescription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          patientName: 'John',
          prescriptionNumber: expect.stringMatching(/^RX-\d+-\d+$/),
          createdBy: 1,
          status: 'pending',
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should allow creating without doctorName (optional)', async () => {
      mockPrescription.create.mockResolvedValue({ id: 2 });

      const req = {
        body: {
          patientName: 'Jane',
          patientPhone: '0779999999',
          medications: [],
        },
        user: { id: 1, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await createPrescription(req, res, mockNext);

      const createArg = mockPrescription.create.mock.calls[0][0];
      expect(createArg.doctorName).toBeUndefined();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should call next on creation error', async () => {
      const error = new Error('Validation failed');
      mockPrescription.create.mockRejectedValue(error);

      const req = {
        body: { patientName: 'Test' },
        user: { id: 1, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await createPrescription(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ────────────────────────── UPDATE PRESCRIPTION ──────────────────────────
  describe('updatePrescription', () => {
    it('should update an existing prescription', async () => {
      const prescription = {
        id: 1,
        update: jest.fn().mockResolvedValue(true),
      };
      mockPrescription.findByPk.mockResolvedValue(prescription);

      const req = {
        params: { id: '1' },
        body: { patientName: 'Updated Name' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await updatePrescription(req, res, mockNext);

      expect(prescription.update).toHaveBeenCalledWith({ patientName: 'Updated Name' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if prescription to update is not found', async () => {
      mockPrescription.findByPk.mockResolvedValue(null);

      const req = {
        params: { id: '999' },
        body: { patientName: 'Updated' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await updatePrescription(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ────────────────────────── VERIFY PRESCRIPTION ──────────────────────────
  describe('verifyPrescription', () => {
    it('should verify a prescription and record verifier', async () => {
      const prescription = {
        id: 1,
        status: 'pending',
        update: jest.fn().mockResolvedValue(true),
      };
      mockPrescription.findByPk.mockResolvedValue(prescription);

      const req = {
        params: { id: '1' },
        user: { id: 2, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await verifyPrescription(req, res, mockNext);

      expect(prescription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'verified',
          verifiedBy: 2,
          verifiedAt: expect.any(Date),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 401 if not authenticated', async () => {
      const req = { params: { id: '1' } } as unknown as AuthRequest;
      const res = mockResponse();

      await verifyPrescription(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if prescription not found', async () => {
      mockPrescription.findByPk.mockResolvedValue(null);

      const req = {
        params: { id: '999' },
        user: { id: 2, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await verifyPrescription(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ────────────────────────── REJECT PRESCRIPTION ──────────────────────────
  describe('rejectPrescription', () => {
    it('should reject a prescription with notes', async () => {
      const prescription = {
        id: 1,
        notes: '',
        update: jest.fn().mockResolvedValue(true),
      };
      mockPrescription.findByPk.mockResolvedValue(prescription);

      const req = {
        params: { id: '1' },
        body: { notes: 'Invalid prescription' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await rejectPrescription(req, res, mockNext);

      expect(prescription.update).toHaveBeenCalledWith({
        status: 'rejected',
        notes: 'Invalid prescription',
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if prescription not found', async () => {
      mockPrescription.findByPk.mockResolvedValue(null);

      const req = {
        params: { id: '999' },
        body: {},
      } as unknown as AuthRequest;
      const res = mockResponse();

      await rejectPrescription(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ────────────────────────── DISPENSE PRESCRIPTION ──────────────────────────
  describe('dispensePrescription', () => {
    it('should dispense a verified prescription', async () => {
      const prescription = {
        id: 1,
        status: 'verified',
        notes: '',
        update: jest.fn().mockResolvedValue(true),
      };
      mockPrescription.findByPk.mockResolvedValue(prescription);

      const req = {
        params: { id: '1' },
        body: {},
        user: { id: 2, role: 'staff' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await dispensePrescription(req, res, mockNext);

      expect(prescription.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'dispensed' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should reject dispensing a non-verified prescription', async () => {
      const prescription = { id: 1, status: 'pending' };
      mockPrescription.findByPk.mockResolvedValue(prescription);

      const req = {
        params: { id: '1' },
        body: {},
        user: { id: 2, role: 'staff' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await dispensePrescription(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Only verified prescriptions can be dispensed' },
      });
    });

    it('should return 401 if not authenticated', async () => {
      const req = {
        params: { id: '1' },
        body: {},
      } as unknown as AuthRequest;
      const res = mockResponse();

      await dispensePrescription(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if prescription not found', async () => {
      mockPrescription.findByPk.mockResolvedValue(null);

      const req = {
        params: { id: '999' },
        body: {},
        user: { id: 2, role: 'staff' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await dispensePrescription(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
