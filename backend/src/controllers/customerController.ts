import { Response, NextFunction } from 'express';
import { Customer } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { phoneNumber: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: customers } = await Customer.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['lastVisit', 'DESC'], ['createdAt', 'DESC']],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        customers,
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

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
export const getCustomer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      res.status(404).json({
        success: false,
        error: { message: 'Customer not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Search customer by phone
// @route   GET /api/customers/phone/:phone
// @access  Private
export const getCustomerByPhone = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await Customer.findOne({
      where: {
        phoneNumber: req.params.phone,
      },
    } as any);

    if (!customer) {
      res.status(404).json({
        success: false,
        error: { message: 'Customer not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;

    // Validation
    if (!firstName || !lastName || !phoneNumber) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide firstName, lastName, and phoneNumber' },
      });
      return;
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      where: {
        phoneNumber,
      },
    } as any);

    if (existingCustomer) {
      res.status(400).json({
        success: false,
        error: { message: 'Customer with this phone number already exists' },
      });
      return;
    }

    // Create customer
    const customer = await Customer.create({
      ...req.body,
      isActive: true,
      loyaltyPoints: 0,
      totalPurchases: 0,
    });

    res.status(201).json({
      success: true,
      data: { customer },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      res.status(404).json({
        success: false,
        error: { message: 'Customer not found' },
      });
      return;
    }

    // Check if phone number is being changed to an existing one
    if (req.body.phoneNumber && req.body.phoneNumber !== customer.phoneNumber) {
      const existingCustomer = await Customer.findOne({
        where: {
          phoneNumber: req.body.phoneNumber,
          id: { [Op.ne]: req.params.id },
        },
      } as any);

      if (existingCustomer) {
        res.status(400).json({
          success: false,
          error: { message: 'Phone number already in use by another customer' },
        });
        return;
      }
    }

    await customer.update(req.body);

    res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Delete customer (soft delete)
// @route   DELETE /api/customers/:id
// @access  Private (admin only)
export const deleteCustomer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      res.status(404).json({
        success: false,
        error: { message: 'Customer not found' },
      });
      return;
    }

    customer.isActive = false;
    await customer.save();

    res.status(200).json({
      success: true,
      data: { message: 'Customer deactivated successfully' },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Add loyalty points to customer
// @route   POST /api/customers/:id/loyalty
// @access  Private
export const addLoyaltyPoints = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide valid points amount' },
      });
      return;
    }

    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      res.status(404).json({
        success: false,
        error: { message: 'Customer not found' },
      });
      return;
    }

    customer.loyaltyPoints = (customer.loyaltyPoints || 0) + Number(points);
    customer.lastVisit = new Date();
    await customer.save();

    res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private
export const getCustomerStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalCustomers = await Customer.count();
    const activeCustomers = await Customer.count({ where: { isActive: true } });
    
    const topCustomers = await Customer.findAll({
      where: { isActive: true },
      order: [['totalPurchases', 'DESC']],
      limit: 10,
      attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'totalPurchases', 'loyaltyPoints'],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        topCustomers,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
