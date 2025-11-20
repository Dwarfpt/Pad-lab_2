import { Router } from 'express';
import {
  getAllParkings,
  getParkingById,
  createParking,
  updateParking,
  deleteParking,
  getParkingsByLocation,
  getParkingOccupiedSpots,
} from '../controllers/parkingController';
import { protect, authorize } from '../middleware/auth';
import { parkingValidation, validate } from '../middleware/validation';

const router = Router();

router.get('/', getAllParkings);
router.get('/nearby', getParkingsByLocation);
router.get('/:id', getParkingById);
router.get('/:id/occupied-spots', getParkingOccupiedSpots);

router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.post('/', parkingValidation, validate, createParking);
router.put('/:id', parkingValidation, validate, updateParking);
router.delete('/:id', deleteParking);

export default router;
