import { Response, NextFunction } from 'express';
import { Medicine, Inventory } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
export const getMedicines = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, requiresPrescription, page = 1, limit = 20 } = req.query;

    const where: any = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { genericName: { [Op.iLike]: `%${search}%` } },
        { brandName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (requiresPrescription !== undefined) {
      where.requiresPrescription = requiresPrescription === 'true';
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: medicines } = await Medicine.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      include: [{ model: Inventory, as: 'inventoryItems' }],
      order: [['name', 'ASC']],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        medicines,
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

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private
export const getMedicine = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const medicine = await Medicine.findByPk(req.params.id, {
      include: [{ model: Inventory, as: 'inventoryItems' }],
    } as any);

    if (!medicine) {
      res.status(404).json({
        success: false,
        error: { message: 'Medicine not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { medicine },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Create medicine
// @route   POST /api/medicines
// @access  Private (admin, pharmacist)
export const createMedicine = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const medicine = await Medicine.create(req.body);

    res.status(201).json({
      success: true,
      data: { medicine },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (admin, pharmacist)
export const updateMedicine = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);

    if (!medicine) {
      res.status(404).json({
        success: false,
        error: { message: 'Medicine not found' },
      });
      return;
    }

    await medicine.update(req.body);

    res.status(200).json({
      success: true,
      data: { medicine },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Delete medicine (soft delete)
// @route   DELETE /api/medicines/:id
// @access  Private (admin)
export const deleteMedicine = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);

    if (!medicine) {
      res.status(404).json({
        success: false,
        error: { message: 'Medicine not found' },
      });
      return;
    }

    medicine.isActive = false;
    await medicine.save();

    res.status(200).json({
      success: true,
      data: { message: 'Medicine deleted successfully' },
    });
  } catch (error: any) {
    next(error);
  }
};
