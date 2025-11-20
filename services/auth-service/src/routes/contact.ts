import express from 'express';
import {
  createSupportMessage,
  getUserSupportChats,
  getSupportChatById,
  addMessageToChat,
  getAllSupportChats,
  updateChatStatus,
} from '../controllers/contactController';
import { protect, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Public routes (with optional auth)
router.post('/', optionalAuth, createSupportMessage);

// User routes (require authentication)
router.get('/', protect, getUserSupportChats);
router.get('/:id', protect, getSupportChatById);
router.post('/:id/messages', protect, addMessageToChat);

// Admin routes
router.get('/admin/all', protect, getAllSupportChats);
router.patch('/:id/status', protect, updateChatStatus);

export default router;