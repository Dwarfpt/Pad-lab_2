import { Router } from 'express';
import bookingRoutes from './bookingRoutes';

const router: Router = Router();

router.use('/bookings', bookingRoutes);

export default router;
