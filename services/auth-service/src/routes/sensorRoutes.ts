import { Router } from 'express';
import { updateSensorData, registerDevice } from '../controllers/sensorController';
import { deviceAuth } from '../middleware/auth';

const router = Router();

router.use(deviceAuth);

router.post('/register', registerDevice);
router.post('/update', updateSensorData);

export default router;
