import { Router } from 'express';
import { register, login, getMe, updateProfile, registerStaff } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// Admin-only routes
router.post('/register-staff', authenticate, authorize('admin'), registerStaff);

export default router;
