import { Router } from 'express';
import { createSubscription } from '../controllers/subscriptionController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createSubscription);

export default router;
