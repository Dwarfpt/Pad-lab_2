import { Router } from 'express';
import {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  publishPost,
  deletePost,
  getAdminPosts,
} from '../controllers/blogController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Публичные маршруты
router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);

// Защищённые маршруты (только админ)
router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.get('/admin/all', getAdminPosts);
router.post('/', createPost);
router.put('/:id', updatePost);
router.put('/:id/publish', publishPost);
router.delete('/:id', deletePost);

export default router;
