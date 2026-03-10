import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mock models - use factory to avoid hoisting issue
const mockFindByPk = jest.fn();
jest.mock('../../models/index.js', () => ({
  User: { findByPk: mockFindByPk },
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

import { authenticate, authorize, AuthRequest } from '../../middleware/auth.js';
const jwtVerify = jwt.verify as jest.Mock;

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ────────────────────────── AUTHENTICATE ──────────────────────────
  describe('authenticate', () => {
    it('should authenticate a valid token and attach user to request', async () => {
      const decoded = { id: 1, username: 'admin', email: 'admin@test.com', role: 'admin' };
      jwtVerify.mockReturnValue(decoded);
      mockFindByPk.mockResolvedValue({ id: 1, isActive: true });

      const req = {
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(jwtVerify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(req.user).toEqual(decoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if no authorization header', async () => {
      const req = { headers: {} } as unknown as AuthRequest;
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: { message: 'No token provided' } })
      );
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      const req = {
        headers: { authorization: 'Basic some-token' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if user not found in database', async () => {
      jwtVerify.mockReturnValue({ id: 999, username: 'ghost', email: 'g@g.com', role: 'user' });
      mockFindByPk.mockResolvedValue(null);

      const req = {
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: { message: 'User not found or inactive' } })
      );
    });

    it('should return 401 if user is inactive', async () => {
      jwtVerify.mockReturnValue({ id: 1, username: 'inactive', email: 'i@i.com', role: 'user' });
      mockFindByPk.mockResolvedValue({ id: 1, isActive: false });

      const req = {
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if token is invalid or expired', async () => {
      jwtVerify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const req = {
        headers: { authorization: 'Bearer expired-token' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: { message: 'Invalid or expired token' } })
      );
    });
  });

  // ────────────────────────── AUTHORIZE ──────────────────────────
  describe('authorize', () => {
    it('should allow access for an authorized role', () => {
      const middleware = authorize('admin', 'staff');
      const req = {
        user: { id: 1, role: 'admin' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for an unauthorized role', () => {
      const middleware = authorize('admin');
      const req = {
        user: { id: 1, role: 'user' },
      } as unknown as AuthRequest;
      const res = mockResponse();

      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 401 if user is not attached to request', () => {
      const middleware = authorize('admin');
      const req = {} as unknown as AuthRequest;
      const res = mockResponse();

      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
