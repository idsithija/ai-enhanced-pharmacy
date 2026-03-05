import { Response, NextFunction } from 'express';
import { Sale, User, Prescription, Inventory } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import sequelize from '../config/database.js';

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
export const getSales = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, cashierId, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (cashierId) {
      where.cashierId = cashierId;
    }

    if (startDate && endDate) {
      where.saleDate = {
        $between: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: sales } = await Sale.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'username', 'firstName', 'lastName'] },
        { model: Prescription, as: 'prescription' },
      ],
      order: [['saleDate', 'DESC']],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        sales,
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

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
export const getSale = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'username', 'firstName', 'lastName'] },
        { model: Prescription, as: 'prescription' },
      ],
    } as any);

    if (!sale) {
      res.status(404).json({
        success: false,
        error: { message: 'Sale not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { sale },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Create sale
// @route   POST /api/sales
// @access  Private (cashier, admin)
export const createSale = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
      return;
    }

    const { items, prescriptionId, customerName, customerPhone, paymentMethod, discount, notes } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Sale must have at least one item' },
      });
      return;
    }

    // Calculate totals
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      // Check inventory availability
      const inventoryItem = await Inventory.findOne({
        where: {
          medicineId: item.medicineId,
          batchNumber: item.batchNumber,
        } as any,
        transaction: t,
      });

      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        await t.rollback();
        res.status(400).json({
          success: false,
          error: { message: `Insufficient stock for ${item.medicineName}` },
        });
        return;
      }

      // Update inventory quantity
      inventoryItem.quantity -= item.quantity;
      await inventoryItem.save({ transaction: t });

      // Calculate item total
      const itemTotal = item.quantity * item.unitPrice - (item.discount || 0);
      subtotal += itemTotal;

      saleItems.push({
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: itemTotal,
      });
    }

    // Calculate tax and total
    const saleDiscount = discount || 0;
    const taxRate = 0.05; // 5% tax
    const tax = (subtotal - saleDiscount) * taxRate;
    const totalAmount = subtotal - saleDiscount + tax;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create sale
    const sale = await Sale.create(
      {
        invoiceNumber,
        cashierId: req.user.id,
        prescriptionId,
        customerName,
        customerPhone,
        items: saleItems,
        subtotal,
        discount: saleDiscount,
        tax,
        totalAmount,
        paymentMethod,
        paymentStatus: 'paid',
        saleDate: new Date(),
        notes,
      },
      { transaction: t }
    );

    // Update prescription status if linked
    if (prescriptionId) {
      const prescription = await Prescription.findByPk(prescriptionId, { transaction: t });
      if (prescription) {
        prescription.status = 'dispensed';
        await prescription.save({ transaction: t });
      }
    }

    await t.commit();

    res.status(201).json({
      success: true,
      data: { sale },
    });
  } catch (error: any) {
    await t.rollback();
    next(error);
  }
};

// @desc    Get sales summary
// @route   GET /api/sales/summary
// @access  Private
export const getSalesSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { paymentStatus: 'paid' };

    if (startDate && endDate) {
      where.saleDate = {
        $between: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const summary = await Sale.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('discount')), 'totalDiscount'],
      ],
    } as any);

    res.status(200).json({
      success: true,
      data: summary[0],
    });
  } catch (error: any) {
    next(error);
  }
};
