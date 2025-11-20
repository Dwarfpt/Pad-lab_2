import express, { Router } from 'express';
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  completeBooking,
  updateBooking,
} from '../controllers/bookingController';
import { protect } from '../middleware/auth';

const router: Router = express.Router();

// User routes
router.post('/', protect, createBooking);
router.get('/', protect, getUserBookings);
router.get('/my-bookings', protect, getUserBookings); // Специальный маршрут для профиля
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/admin/all', protect, getAllBookings);
router.patch('/:id', protect, updateBooking);
router.patch('/:id/complete', protect, completeBooking);

export default router;
