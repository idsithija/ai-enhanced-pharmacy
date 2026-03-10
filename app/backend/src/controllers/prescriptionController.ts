import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import path from 'path';
import multer from 'multer';
import { Prescription, User } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

// Multer config — save prescription images to backend/uploads/prescriptions/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads/prescriptions'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `rx-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, safeName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, webp) and PDFs are allowed'));
    }
  },
});

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, patientName, page = 1, limit = 20 } = req.query;

    const where: any = {};

    // Regular users only see their own prescriptions
    if (req.user && req.user.role === 'user') {
      where.createdBy = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (patientName) {
      where.patientName = { [Op.iLike]: `%${patientName}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      include: [{ model: User, as: 'verifiedByUser', attributes: ['id', 'username', 'firstName', 'lastName'] }],
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

// @desc    Get current user's prescriptions
// @route   GET /api/prescriptions/my
// @access  Private
export const getMyPrescriptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      return;
    }

    const { status, page = 1, limit = 20 } = req.query;
    const where: any = { createdBy: req.user.id };

    if (status) {
      where.status = status;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      include: [{ model: User, as: 'verifiedByUser', attributes: ['id', 'username', 'firstName', 'lastName'] }],
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
      include: [{ model: User, as: 'verifiedByUser', attributes: ['id', 'username', 'firstName', 'lastName'] }],
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
    const prescriptionNumber = `RX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const prescription = await Prescription.create({
      ...req.body,
      prescriptionNumber,
      patientName: req.body.patientName || req.user?.username || 'Unknown',
      patientPhone: req.body.patientPhone || '',
      prescriptionDate: req.body.prescriptionDate || new Date(),
      medications: req.body.medications || [],
      createdBy: req.user?.id,
      status: req.body.status || 'pending',
    });

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

    await prescription.update({
      status: 'verified',
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    });

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

    await prescription.update({
      status: 'rejected',
      notes: req.body.notes || prescription.notes,
    });

    res.status(200).json({
      success: true,
      data: { prescription },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Dispense prescription
// @route   PUT /api/prescriptions/:id/dispense
// @access  Private (pharmacist, admin)
export const dispensePrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      return;
    }

    const prescription = await Prescription.findByPk(req.params.id);

    if (!prescription) {
      res.status(404).json({ success: false, error: { message: 'Prescription not found' } });
      return;
    }

    if (prescription.status !== 'verified') {
      res.status(400).json({ success: false, error: { message: 'Only verified prescriptions can be dispensed' } });
      return;
    }

    await prescription.update({
      status: 'dispensed',
      notes: req.body.notes || prescription.notes,
    });

    res.status(200).json({
      success: true,
      data: { prescription },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Cancel prescription (user can cancel their own pending orders)
// @route   PUT /api/prescriptions/:id/cancel
// @access  Private
export const cancelPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      return;
    }

    const prescription = await Prescription.findByPk(req.params.id);

    if (!prescription) {
      res.status(404).json({ success: false, error: { message: 'Prescription not found' } });
      return;
    }

    if (prescription.createdBy !== req.user.id) {
      res.status(403).json({ success: false, error: { message: 'You can only cancel your own orders' } });
      return;
    }

    if (prescription.status !== 'pending') {
      res.status(400).json({ success: false, error: { message: 'Only pending orders can be cancelled' } });
      return;
    }

    await prescription.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      data: { prescription },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Upload prescription image and create prescription order
// @route   POST /api/prescriptions/upload
// @access  Private
export const uploadPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No image file uploaded' } });
      return;
    }

    const imageUrl = `/uploads/prescriptions/${req.file.filename}`;
    const prescriptionNumber = `RX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const prescription = await Prescription.create({
      prescriptionNumber,
      patientName: req.body.patientName || req.user.username || 'Unknown',
      patientPhone: req.body.patientPhone || '',
      doctorName: req.body.doctorName || 'Pending Review',
      medications: [],
      prescriptionDate: new Date(),
      imageUrl,
      status: 'pending',
      notes: req.body.notes || '',
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: { prescription },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Upload prescription image only (returns URL)
// @route   POST /api/prescriptions/upload-image
// @access  Private
export const uploadPrescriptionImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No image file uploaded' } });
      return;
    }

    const url = `/uploads/prescriptions/${req.file.filename}`;
    res.status(200).json({ success: true, data: { url } });
  } catch (error: any) {
    next(error);
  }
};
