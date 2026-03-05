import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

// Generate JWT token
const generateToken = (userId: number, username: string, email: string, role: string): string => {
  const payload = { id: userId, username, email, role };
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  // @ts-ignore - TypeScript has issues with expiresIn type inference
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (but only admin can create other admins)
export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
        email,
      } as any,
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: { message: 'User with this email already exists' },
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
      role: role || 'cashier',
      phoneNumber,
      isActive: true,
    });

    // Generate token
    const token = generateToken(user.id, user.username, user.email, user.role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
        },
        token,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: { message: 'Please provide email and password' },
      });
      return;
    }

    // Find user
    const user = await User.findOne({
      where: {
        email,
      } as any,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: { message: 'Account is deactivated' },
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id, user.username, user.email, user.role);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
      return;
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
      return;
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    const { firstName, lastName, phoneNumber } = req.body;

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};
