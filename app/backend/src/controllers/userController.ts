import { Response, NextFunction } from 'express';
import { User } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin only)
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, role, isActive, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] }, // Don't return passwords
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    } as any);

    res.status(200).json({
      success: true,
      data: {
        users,
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

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (admin only)
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    } as any);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (admin only)
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, role, phoneNumber } = req.body;

    // Validation
    if (!username || !email || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide all required fields' },
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    } as any);

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: { message: 'User with this email or username already exists' },
      });
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'staff',
      phoneNumber,
      isActive: true,
    });

    // Return user without password
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      data: { user: userWithoutPassword },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin only)
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    const { firstName, lastName, phoneNumber, role, isActive, email, username } = req.body;

    // Check if email/username is being changed to an existing one
    if (email || username) {
      const existingUser = await User.findOne({
        where: {
          id: { [Op.ne]: req.params.id },
          [Op.or]: [
            ...(email ? [{ email }] : []),
            ...(username ? [{ username }] : []),
          ],
        },
      } as any);

      if (existingUser) {
        res.status(400).json({
          success: false,
          error: { message: 'Email or username already in use by another user' },
        });
        return;
      }
    }

    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (email !== undefined) user.email = email;
    if (username !== undefined) user.username = username;

    await user.save();

    // Return user without password
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: { user: userWithoutPassword },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Delete/Deactivate user
// @route   DELETE /api/users/:id
// @access  Private (admin only)
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    // Prevent deleting self
    if (req.user && req.user.id === Number(req.params.id)) {
      res.status(400).json({
        success: false,
        error: { message: 'Cannot delete your own account' },
      });
      return;
    }

    // Soft delete - just deactivate
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      data: { message: 'User deactivated successfully' },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (admin only)
export const getUserStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = totalUsers - activeUsers;

    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count'],
      ],
      where: { isActive: true },
      group: ['role'],
      raw: true,
    } as any);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
