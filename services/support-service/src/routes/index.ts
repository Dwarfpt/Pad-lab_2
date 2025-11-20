import { Router } from 'express';
import contactRoutes from './contact';
import supportRoutes from './supportRoutes';

const router: Router = Router();

router.use('/contact', contactRoutes);
router.use('/support', supportRoutes);

export default router;
