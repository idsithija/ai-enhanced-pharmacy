import { Response, NextFunction } from 'express';
import { Sale, Medicine, Inventory, Prescription, Customer, User } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/database.js';

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private
export const getSalesReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide startDate and endDate' },
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    // Include the full end date by setting time to end of day
    end.setHours(23, 59, 59, 999);

    // Get all sales in date range
    const sales = await Sale.findAll({
      where: {
        saleDate: {
          [Op.between]: [start, end],
        },
      },
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'firstName', 'lastName'] },
        { model: Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
      ],
      order: [['saleDate', 'ASC']],
    } as any);

    // Calculate statistics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalProfit = sales.reduce((sum, sale) => sum + Number(sale.totalAmount) - Number(sale.subtotal) * 0.7, 0); // Assuming 30% profit margin
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Group by period
    let groupedData: any = {};
    
    sales.forEach((sale) => {
      let key = '';
      const raw = (sale as any).saleDate ?? (sale as any).sale_date ?? (sale as any).createdAt ?? (sale as any).created_at;
      const date = new Date(raw);
      if (isNaN(date.getTime())) return; // skip records with invalid dates
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekNum = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-W${weekNum}`;
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          sales: 0,
          revenue: 0,
          orders: 0,
        };
      }

      groupedData[key].sales += Number(sale.totalAmount);
      groupedData[key].revenue += Number(sale.totalAmount);
      groupedData[key].orders += 1;
    });

    const chartData = Object.values(groupedData);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSales,
          totalRevenue,
          totalProfit,
          averageOrderValue,
          dateRange: { startDate, endDate },
        },
        chartData,
        sales,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private
export const getInventoryReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type = 'full', expiringSoon } = req.query;

    const where: any = {};

    // Filter based on report type
    if (type === 'low-stock') {
      where.status = 'low_stock';
    } else if (type === 'out-of-stock') {
      where.status = 'out_of_stock';
    } else if (type === 'expiring' || expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expiryDate = {
        [Op.lte]: thirtyDaysFromNow,
        [Op.gt]: new Date(),
      };
    }

    const inventory = await Inventory.findAll({
      where,
      include: [{ model: Medicine, as: 'medicine' }],
      order: [['expiryDate', 'ASC']],
    } as any);

    // Calculate statistics
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const lowStockCount = await Inventory.count({ where: { status: 'low_stock' } });
    const outOfStockCount = await Inventory.count({ where: { status: 'out_of_stock' } });
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringCount = await Inventory.count({
      where: {
        expiryDate: {
          [Op.lte]: thirtyDaysFromNow,
          [Op.gt]: new Date(),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalItems,
          totalValue,
          lowStockCount,
          outOfStockCount,
          expiringCount,
        },
        inventory,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get profit/loss report
// @route   GET /api/reports/profit-loss
// @access  Private (admin only)
export const getProfitLossReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide startDate and endDate' },
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);

    // Get sales revenue
    const salesData: any = await Sale.findAll({
      where: {
        saleDate: {
          [Op.between]: [start, end],
        },
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalSubtotal'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
      ],
      raw: true,
    } as any);

    const totalRevenue = Number(salesData[0]?.totalRevenue || 0);
    const totalSubtotal = Number(salesData[0]?.totalSubtotal || 0);
    const totalOrders = Number(salesData[0]?.totalOrders || 0);

    // Estimate cost of goods sold (assuming 70% of subtotal is cost)
    const costOfGoodsSold = totalSubtotal * 0.7;
    const grossProfit = totalRevenue - costOfGoodsSold;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Operating expenses (can be customized)
    const operatingExpenses = {
      salaries: 5000, // Fixed monthly salary
      rent: 2000,
      utilities: 500,
      others: 1000,
    };

    const totalOperatingExpenses = Object.values(operatingExpenses).reduce((sum, val) => sum + val, 0);
    const netProfit = grossProfit - totalOperatingExpenses;
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        dateRange: { startDate, endDate },
        revenue: {
          totalRevenue,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        costs: {
          costOfGoodsSold,
          operatingExpenses,
          totalOperatingExpenses,
          totalCosts: costOfGoodsSold + totalOperatingExpenses,
        },
        profit: {
          grossProfit,
          grossProfitMargin: grossProfitMargin.toFixed(2) + '%',
          netProfit,
          netProfitMargin: netProfitMargin.toFixed(2) + '%',
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get prescription history report
// @route   GET /api/reports/prescriptions
// @access  Private
export const getPrescriptionReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, startDate, endDate, status } = req.query;

    const where: any = {};

    if (patientId) {
      where.patientName = { [Op.iLike]: `%${patientId}%` };
    }

    if (startDate && endDate) {
      where.prescriptionDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    if (status) {
      where.status = status;
    }

    const prescriptions = await Prescription.findAll({
      where,
      include: [
        { model: User, as: 'verifiedByUser', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['prescriptionDate', 'DESC']],
    } as any);

    // Statistics
    const totalPrescriptions = prescriptions.length;
    const verifiedCount = prescriptions.filter((p) => p.status === 'verified').length;
    const pendingCount = prescriptions.filter((p) => p.status === 'pending').length;
    const rejectedCount = prescriptions.filter((p) => p.status === 'rejected').length;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPrescriptions,
          verifiedCount,
          pendingCount,
          rejectedCount,
        },
        prescriptions,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get top selling medicines
// @route   GET /api/reports/top-medicines
// @access  Private
export const getTopMedicines = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = 'month', limit = 10 } = req.query;

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Get sales data grouped by medicine
    const topMedicines = await sequelize.query(
      `
      SELECT 
        m.id,
        m.name,
        m.generic_name,
        m.category,
        COUNT(s.id) as order_count,
        SUM(CAST(s.total_amount AS DECIMAL)) as total_revenue
      FROM sales s
      CROSS JOIN LATERAL jsonb_array_elements(s.items) as item
      JOIN medicines m ON (item->>'medicineId')::int = m.id
      WHERE s.sale_date BETWEEN :startDate AND :endDate
      GROUP BY m.id, m.name, m.generic_name, m.category
      ORDER BY total_revenue DESC
      LIMIT :limit
      `,
      {
        replacements: { startDate, endDate, limit: Number(limit) },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        topMedicines,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get customer purchase history
// @route   GET /api/reports/customer-history/:id
// @access  Private
export const getCustomerPurchaseHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customerId = req.params.id;

    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      res.status(404).json({
        success: false,
        error: { message: 'Customer not found' },
      });
      return;
    }

    const sales = await Sale.findAll({
      where: { customerId },
      order: [['saleDate', 'DESC']],
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'firstName', 'lastName'] },
      ],
    } as any);

    const totalPurchases = sales.length;
    const totalSpent = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const averagePurchase = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    res.status(200).json({
      success: true,
      data: {
        customer,
        summary: {
          totalPurchases,
          totalSpent,
          averagePurchase,
          loyaltyPoints: customer.loyaltyPoints,
        },
        purchases: sales,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
