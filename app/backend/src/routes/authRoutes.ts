import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, registerStaff } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Admin-only routes
router.post('/register-staff', authenticate, authorize('admin'), registerStaff);

export default router;
