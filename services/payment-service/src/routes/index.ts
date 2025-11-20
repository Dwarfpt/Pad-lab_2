import { Router } from 'express';
import tariffRoutes from './tariffRoutes';
import balanceRoutes from './balanceRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import { getUserTransactions } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router: Router = Router();

router.use('/tariffs', tariffRoutes);
router.use('/balance', balanceRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.get('/transactions', protect, getUserTransactions);

export default router;
