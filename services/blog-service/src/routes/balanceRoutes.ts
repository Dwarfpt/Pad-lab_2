import express from 'express';
import {
  getBalance,
  depositBalance,
  withdrawBalance,
  convertCurrency,
  getTransactions,
  updatePreferredCurrency,
  getAllTransactions,
  updateTransactionStatus,
  getExchangeRatesController,
} from '../controllers/balanceController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication needed for exchange rates)
router.get('/exchange-rates', getExchangeRatesController);

// User routes
router.get('/balance', protect, getBalance);
router.post('/deposit', protect, depositBalance);
router.post('/top-up', protect, depositBalance); // Alias for deposit
router.post('/withdraw', protect, withdrawBalance);
router.post('/convert', protect, convertCurrency);
router.get('/transactions', protect, getTransactions);
router.patch('/preferred-currency', protect, updatePreferredCurrency);

// Admin routes
router.get('/admin/transactions', protect, getAllTransactions);
router.patch('/admin/transactions/:id', protect, updateTransactionStatus);

export default router;
