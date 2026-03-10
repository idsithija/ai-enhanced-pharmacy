import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';

// Mock models
const mockMedicine = {
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockInventory = {};

jest.mock('../../models/index.js', () => ({
  Medicine: mockMedicine,
  Inventory: mockInventory,
}));

import {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../../controllers/medicineController.js';

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

describe('Medicine Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ────────────────────────── GET MEDICINES ──────────────────────────
  describe('getMedicines', () => {
    it('should return paginated medicines', async () => {
      const medicines = [
        { id: 1, name: 'Paracetamol', category: 'Analgesics' },
        { id: 2, name: 'Amoxicillin', category: 'Antibiotics' },
      ];
      mockMedicine.findAndCountAll.mockResolvedValue({ count: 2, rows: medicines });

      const req = { query: { page: '1', limit: '20' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getMedicines(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            medicines,
            pagination: { total: 2, page: 1, pages: 1 },
          }),
        })
      );
    });

    it('should apply search filter across name, genericName, brandName', async () => {
      mockMedicine.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const req = { query: { search: 'para', page: '1', limit: '20' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getMedicines(req, res, mockNext);

      expect(mockMedicine.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter by category', async () => {
      mockMedicine.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const req = { query: { category: 'Analgesics', page: '1', limit: '20' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getMedicines(req, res, mockNext);

      expect(mockMedicine.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            category: 'Analgesics',
          }),
        })
      );
    });

    it('should filter by requiresPrescription flag', async () => {
      mockMedicine.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const req = { query: { requiresPrescription: 'true', page: '1', limit: '20' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getMedicines(req, res, mockNext);

      expect(mockMedicine.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            requiresPrescription: true,
          }),
        })
      );
    });

    it('should only return active medicines', async () => {
      mockMedicine.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const req = { query: { page: '1', limit: '20' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getMedicines(req, res, mockNext);

      expect(mockMedicine.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });

    it('should call next on error', async () => {
      const error = new Error('DB error');
      mockMedicine.findAndCountAll.mockRejectedValue(error);

      const req = { query: { page: '1', limit: '20' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getMedicines(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ────────────────────────── GET SINGLE MEDICINE ──────────────────────────
  describe('getMedicine', () => {
    it('should return a medicine by ID', async () => {
      const medicine = { id: 1, name: 'Paracetamol' };
      mockMedicine.findByPk.mockResolvedValue(medicine);

      const req = { params: { id: '1' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getMedicine(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { medicine },
      });
    });

    it('should return 404 if medicine not found', async () => {
      mockMedicine.findByPk.mockResolvedValue(null);

      const req = { params: { id: '999' } } as unknown as AuthRequest;
      const res = mockResponse();

      await getMedicine(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Medicine not found' },
      });
    });
  });

  // ────────────────────────── CREATE MEDICINE ──────────────────────────
  describe('createMedicine', () => {
    it('should create a new medicine', async () => {
      const newMedicine = { id: 1, name: 'Ibuprofen', category: 'Analgesics' };
      mockMedicine.create.mockResolvedValue(newMedicine);

      const req = {
        body: { name: 'Ibuprofen', genericName: 'Ibuprofen', category: 'Analgesics', dosageForm: 'Tablet', strength: '400mg', manufacturer: 'PharmaCo' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await createMedicine(req, res, mockNext);

      expect(mockMedicine.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should call next on creation error', async () => {
      const error = new Error('Validation error');
      mockMedicine.create.mockRejectedValue(error);

      const req = { body: {} } as unknown as AuthRequest;
      const res = mockResponse();

      await createMedicine(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ────────────────────────── UPDATE MEDICINE ──────────────────────────
  describe('updateMedicine', () => {
    it('should update an existing medicine', async () => {
      const medicine = {
        id: 1,
        name: 'Old Name',
        update: jest.fn().mockResolvedValue(true),
      };
      mockMedicine.findByPk.mockResolvedValue(medicine);

      const req = {
        params: { id: '1' },
        body: { name: 'New Name' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await updateMedicine(req, res, mockNext);

      expect(medicine.update).toHaveBeenCalledWith({ name: 'New Name' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if medicine to update not found', async () => {
      mockMedicine.findByPk.mockResolvedValue(null);

      const req = {
        params: { id: '999' },
        body: { name: 'Test' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await updateMedicine(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ────────────────────────── DELETE (SOFT) MEDICINE ──────────────────────────
  describe('deleteMedicine', () => {
    it('should soft delete a medicine by setting isActive to false', async () => {
      const medicine = {
        id: 1,
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      };
      mockMedicine.findByPk.mockResolvedValue(medicine);

      const req = { params: { id: '1' } } as unknown as AuthRequest;
      const res = mockResponse();

      await deleteMedicine(req, res, mockNext);

      expect(medicine.isActive).toBe(false);
      expect(medicine.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Medicine deleted successfully' },
      });
    });

    it('should return 404 if medicine to delete not found', async () => {
      mockMedicine.findByPk.mockResolvedValue(null);

      const req = { params: { id: '999' } } as unknown as AuthRequest;
      const res = mockResponse();

      await deleteMedicine(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
