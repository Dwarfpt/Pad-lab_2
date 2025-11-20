import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  generateQRCodeLogin,
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { registerValidation, loginValidation, validate } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/qr-code', protect, generateQRCodeLogin);

export default router;
