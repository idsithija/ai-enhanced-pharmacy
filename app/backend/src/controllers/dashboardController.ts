import { Response, NextFunction } from 'express';
import { Sale, Medicine, Inventory, Prescription, User } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total sales today
    const todaySales = await Sale.count({
      where: {
        saleDate: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    } as any);

    // Total revenue today
    const todayRevenue = await Sale.sum('total_amount' as any, {
      where: {
        saleDate: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
        paymentStatus: 'paid',
      },
    } as any);

    // Low stock items
    const lowStockCount = await Inventory.count({
      where: {
        status: 'low_stock',
      },
    } as any);

    // Expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoonCount = await Inventory.count({
      where: {
        expiryDate: {
          [Op.lte]: thirtyDaysFromNow,
          [Op.gt]: new Date(),
        },
      },
    } as any);

    // Pending prescriptions
    const pendingPrescriptions = await Prescription.count({
      where: {
        status: 'pending',
      },
    } as any);

    // Total medicines
    const totalMedicines = await Medicine.count({
      where: {
        isActive: true,
      },
    } as any);

    // Total users
    const totalUsers = await User.count({
      where: {
        isActive: true,
      },
    } as any);

    res.status(200).json({
      success: true,
      data: {
        todaySales,
        todayRevenue: todayRevenue || 0,
        lowStockCount,
        expiringSoonCount,
        pendingPrescriptions,
        totalMedicines,
        totalUsers,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get recent sales
// @route   GET /api/dashboard/recent-sales
// @access  Private
export const getRecentSales = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sales = await Sale.findAll({
      limit: 10,
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'username', 'firstName', 'lastName'] },
      ],
      order: [['saleDate', 'DESC']],
    } as any);

    res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get sales chart data
// @route   GET /api/dashboard/sales-chart
// @access  Private
export const getSalesChartData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { days = 7 } = req.query;
    const daysCount = Number(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    startDate.setHours(0, 0, 0, 0);

    const salesData = await Sale.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('sale_date')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      ],
      where: {
        saleDate: {
          [Op.gte]: startDate,
        },
      },
      group: [sequelize.fn('DATE', sequelize.col('sale_date'))],
      order: [[sequelize.fn('DATE', sequelize.col('sale_date')), 'ASC']],
    } as any);

    res.status(200).json({
      success: true,
      data: { salesData },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get low stock items
// @route   GET /api/dashboard/low-stock
// @access  Private
export const getLowStock = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lowStockItems = await Inventory.findAll({
      where: {
        status: 'low_stock',
      },
      include: [
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'genericName'] },
      ],
      order: [['quantity', 'ASC']],
      limit: 10,
    } as any);

    // Map to the expected format
    const formattedItems = lowStockItems.map((item: any) => ({
      id: item.id,
      medicineName: item.medicine?.name || 'Unknown',
      quantity: item.quantity,
      batchNumber: item.batchNumber,
    }));

    res.status(200).json({
      success: true,
      data: formattedItems,
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get expiring items
// @route   GET /api/dashboard/expiring-items
// @access  Private
export const getExpiringItems = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringItems = await Inventory.findAll({
      where: {
        expiryDate: {
          [Op.lte]: thirtyDaysFromNow,
          [Op.gt]: new Date(),
        },
      },
      include: [
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'genericName'] },
      ],
      order: [['expiryDate', 'ASC']],
      limit: 10,
    } as any);

    // Map to the expected format
    const formattedItems = expiringItems.map((item: any) => ({
      id: item.id,
      medicineName: item.medicine?.name || 'Unknown',
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      batchNumber: item.batchNumber,
    }));

    res.status(200).json({
      success: true,
      data: formattedItems,
    });
  } catch (error: any) {
    next(error);
  }
};
