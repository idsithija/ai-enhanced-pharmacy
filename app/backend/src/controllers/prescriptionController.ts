import { Response, NextFunction } from 'express';
import { Prescription, User } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, patientName, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (patientName) {
      where.patientName = { $iLike: `%${patientName}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      include: [{ model: User, as: 'verifier', attributes: ['id', 'username', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          total: count,
          page: Number(page),
          pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: [{ model: User, as: 'verifier', attributes: ['id', 'username', 'firstName', 'lastName'] }],
    } as any);

    if (!prescription) {
      res.status(404).json({
        success: false,
        error: { message: 'Prescription not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { prescription },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private (pharmacist, admin)
export const createPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prescription = await Prescription.create(req.body);

    res.status(201).json({
      success: true,
      data: { prescription },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (pharmacist, admin)
export const updatePrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prescription = await Prescription.findByPk(req.params.id);

    if (!prescription) {
      res.status(404).json({
        success: false,
        error: { message: 'Prescription not found' },
      });
      return;
    }

    await prescription.update(req.body);

    res.status(200).json({
      success: true,
      data: { prescription },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Verify prescription
// @route   PUT /api/prescriptions/:id/verify
// @access  Private (pharmacist, admin)
export const verifyPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
      return;
    }

    const prescription = await Prescription.findByPk(req.params.id);

    if (!prescription) {
      res.status(404).json({
        success: false,
        error: { message: 'Prescription not found' },
      });
      return;
    }

    prescription.status = 'verified';
    prescription.verifiedBy = req.user.id;
    prescription.verifiedAt = new Date();
    await prescription.save();

    res.status(200).json({
      success: true,
      data: { prescription },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Reject prescription
// @route   PUT /api/prescriptions/:id/reject
// @access  Private (pharmacist, admin)
export const rejectPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prescription = await Prescription.findByPk(req.params.id);

    if (!prescription) {
      res.status(404).json({
        success: false,
        error: { message: 'Prescription not found' },
      });
      return;
    }

    prescription.status = 'rejected';
    prescription.notes = req.body.notes || prescription.notes;
    await prescription.save();

    res.status(200).json({
      success: true,
      data: { prescription },
    });
  } catch (error: any) {
    next(error);
  }
};
