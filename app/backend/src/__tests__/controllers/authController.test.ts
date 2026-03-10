import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';

// Mock User model
const mockUser = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

jest.mock('../../models/index.js', () => ({
  User: mockUser,
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
}));

import { register, login, getMe } from '../../controllers/authController.js';

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ────────────────────────── REGISTER ──────────────────────────
  describe('register', () => {
    it('should register a new user and return token', async () => {
      mockUser.findOne.mockResolvedValue(null);
      mockUser.create.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        phoneNumber: '0771234567',
      });

      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '0771234567',
        },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await register(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({ email: 'test@example.com', role: 'user' }),
            token: 'mock-jwt-token',
          }),
        })
      );
    });

    it('should always set role to user for public registration', async () => {
      mockUser.findOne.mockResolvedValue(null);
      mockUser.create.mockResolvedValue({
        id: 1,
        username: 'hacker',
        email: 'hack@test.com',
        firstName: 'H',
        lastName: 'K',
        role: 'user',
      });

      const req = {
        body: {
          username: 'hacker',
          email: 'hack@test.com',
          password: 'pass1234',
          firstName: 'H',
          lastName: 'K',
          role: 'admin', // trying to escalate
        },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await register(req, res, mockNext);

      expect(mockUser.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'user' })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const req = {
        body: { email: 'test@example.com' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await register(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: { message: 'Please provide all required fields' },
        })
      );
    });

    it('should return 400 if email already exists', async () => {
      mockUser.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await register(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: { message: 'User with this email already exists' },
        })
      );
    });
  });

  // ────────────────────────── LOGIN ──────────────────────────
  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockUserObj = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        phoneNumber: '0771234567',
        isActive: true,
        lastLogin: null,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };
      mockUser.findOne.mockResolvedValue(mockUserObj);

      const req = {
        body: { email: 'test@example.com', password: 'password123' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await login(req, res, mockNext);

      expect(mockUserObj.comparePassword).toHaveBeenCalledWith('password123');
      expect(mockUserObj.save).toHaveBeenCalled(); // updates lastLogin
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            token: 'mock-jwt-token',
          }),
        })
      );
    });

    it('should return 400 if email or password missing', async () => {
      const req = {
        body: { email: 'test@example.com' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 401 if user not found', async () => {
      mockUser.findOne.mockResolvedValue(null);

      const req = {
        body: { email: 'nobody@example.com', password: 'pass' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: { message: 'Invalid credentials' } })
      );
    });

    it('should return 401 if account is deactivated', async () => {
      mockUser.findOne.mockResolvedValue({
        id: 1,
        isActive: false,
      });

      const req = {
        body: { email: 'test@example.com', password: 'pass' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: { message: 'Account is deactivated' } })
      );
    });

    it('should return 401 if password is invalid', async () => {
      mockUser.findOne.mockResolvedValue({
        id: 1,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false),
      });

      const req = {
        body: { email: 'test@example.com', password: 'wrongpass' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: { message: 'Invalid credentials' } })
      );
    });
  });

  // ────────────────────────── GET ME ──────────────────────────
  describe('getMe', () => {
    it('should return authenticated user profile', async () => {
      mockUser.findByPk.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        phoneNumber: '0771234567',
        lastLogin: new Date(),
      });

      const req = {
        user: { id: 1, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await getMe(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({ id: 1 }),
          }),
        })
      );
    });

    it('should return 401 if not authenticated', async () => {
      const req = {} as unknown as AuthRequest;
      const res = mockResponse();

      await getMe(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if user not found in DB', async () => {
      mockUser.findByPk.mockResolvedValue(null);

      const req = {
        user: { id: 999, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await getMe(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
