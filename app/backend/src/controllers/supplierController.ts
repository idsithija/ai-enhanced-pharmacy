import { Response, NextFunction } from 'express';
import { Supplier } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { companyName: { [Op.iLike]: `%${search}%` } },
        { contactPerson: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phoneNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: suppliers } = await Supplier.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['companyName', 'ASC']],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        suppliers,
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

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
export const getSupplier = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      res.status(404).json({
        success: false,
        error: { message: 'Supplier not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { supplier },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (admin, inventory_manager)
export const createSupplier = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { companyName, email, phoneNumber } = req.body;

    // Validation
    if (!companyName || !email || !phoneNumber) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide companyName, email, and phoneNumber' },
      });
      return;
    }

    // Check if supplier already exists
    const existingSupplier = await Supplier.findOne({
      where: {
        [Op.or]: [{ email }, { phoneNumber }],
      },
    } as any);

    if (existingSupplier) {
      res.status(400).json({
        success: false,
        error: { message: 'Supplier with this email or phone number already exists' },
      });
      return;
    }

    // Create supplier
    const supplier = await Supplier.create({
      ...req.body,
      isActive: true,
      currentBalance: 0,
    });

    res.status(201).json({
      success: true,
      data: { supplier },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (admin, inventory_manager)
export const updateSupplier = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      res.status(404).json({
        success: false,
        error: { message: 'Supplier not found' },
      });
      return;
    }

    // Check if email/phone is being changed to an existing one
    if (req.body.email || req.body.phoneNumber) {
      const duplicateCheck: any = {};
      
      if (req.body.email && req.body.email !== supplier.email) {
        duplicateCheck.email = req.body.email;
      }
      
      if (req.body.phoneNumber && req.body.phoneNumber !== supplier.phoneNumber) {
        duplicateCheck.phoneNumber = req.body.phoneNumber;
      }

      if (Object.keys(duplicateCheck).length > 0) {
        const existingSupplier = await Supplier.findOne({
          where: {
            [Op.or]: [duplicateCheck],
            id: { [Op.ne]: req.params.id },
          },
        } as any);

        if (existingSupplier) {
          res.status(400).json({
            success: false,
            error: { message: 'Email or phone number already in use by another supplier' },
          });
          return;
        }
      }
    }

    await supplier.update(req.body);

    res.status(200).json({
      success: true,
      data: { supplier },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Delete supplier (soft delete)
// @route   DELETE /api/suppliers/:id
// @access  Private (admin only)
export const deleteSupplier = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      res.status(404).json({
        success: false,
        error: { message: 'Supplier not found' },
      });
      return;
    }

    supplier.isActive = false;
    await supplier.save();

    res.status(200).json({
      success: true,
      data: { message: 'Supplier deactivated successfully' },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get supplier statistics
// @route   GET /api/suppliers/stats
// @access  Private
export const getSupplierStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalSuppliers = await Supplier.count();
    const activeSuppliers = await Supplier.count({ where: { isActive: true } });
    
    const topSuppliers = await Supplier.findAll({
      where: { isActive: true },
      order: [['rating', 'DESC']],
      limit: 10,
      attributes: ['id', 'companyName', 'contactPerson', 'email', 'phoneNumber', 'rating', 'currentBalance'],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        totalSuppliers,
        activeSuppliers,
        topSuppliers,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
