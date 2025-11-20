import { Router } from 'express';
import {
  getAllTariffs,
  getTariffById,
  createTariff,
  updateTariff,
  deleteTariff,
} from '../controllers/tariffController';
import { protect, authorize } from '../middleware/auth';
import { tariffValidation, validate } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', getAllTariffs);
router.get('/:id', getTariffById);

// Protected routes (admin only)
router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.post('/', tariffValidation, validate, createTariff);
router.put('/:id', tariffValidation, validate, updateTariff);
router.delete('/:id', deleteTariff);

export default router;
