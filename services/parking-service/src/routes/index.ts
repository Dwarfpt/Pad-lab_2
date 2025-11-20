import { Router } from 'express';
import parkingRoutes from './parkingRoutes';
import sensorRoutes from './sensorRoutes';

const router: Router = Router();

router.use('/parkings', parkingRoutes);
router.use('/sensors', sensorRoutes);

export default router;
