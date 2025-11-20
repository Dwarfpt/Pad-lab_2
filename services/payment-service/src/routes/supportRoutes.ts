import express from 'express';
import { body, param } from 'express-validator';
import {
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  getTicketMessages,
  sendMessage,
  createTicket,
  getUserTickets,
  getSupportStats
} from '../controllers/supportController';
import { protect, authorize } from '../middleware/auth';

const router: express.Router = express.Router();

// Admin routes - require admin role
router.get('/admin/tickets', protect, authorize('admin', 'super-admin'), getAllTickets);
router.get('/admin/tickets/:id', protect, authorize('admin', 'super-admin'), param('id').notEmpty(), getTicketById);
router.put('/admin/tickets/:id/status', 
  protect, 
  authorize('admin', 'super-admin'),
  param('id').notEmpty(),
  body('status').isIn(['open', 'in_progress', 'closed']),
  updateTicketStatus
);
router.get('/admin/tickets/:ticketId/messages', 
  protect, 
  authorize('admin', 'super-admin'),
  param('ticketId').notEmpty(),
  getTicketMessages
);
router.post('/admin/tickets/:ticketId/messages', 
  protect,
  authorize('admin', 'super-admin'),
  param('ticketId').notEmpty(),
  body('message').trim().isLength({ min: 1, max: 1000 }),
  sendMessage
);
router.get('/admin/stats', protect, authorize('admin', 'super-admin'), getSupportStats);

// User routes - require authentication
router.post('/tickets', 
  protect,
  body('subject').trim().isLength({ min: 1, max: 200 }),
  body('message').trim().isLength({ min: 1, max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  createTicket
);
router.get('/tickets', protect, getUserTickets);
router.get('/tickets/:ticketId/messages', 
  protect,
  param('ticketId').notEmpty(),
  getTicketMessages
);
router.post('/tickets/:ticketId/messages', 
  protect,
  param('ticketId').notEmpty(),
  body('message').trim().isLength({ min: 1, max: 1000 }),
  sendMessage
);

export default router;