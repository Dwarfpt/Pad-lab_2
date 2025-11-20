import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateSlug } from '../utils/helpers';

export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const category = req.query.category as string;

  const query: any = { isPublished: true };
  if (category) {
    query.category = category;
  }

  const posts = await BlogPost.find(query)
    .populate('author', 'firstName lastName')
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ publishedAt: -1 });

  const total = await BlogPost.countDocuments(query);

  res.json({
    success: true,
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findOne({ slug: req.params.slug }).populate(
    'author',
    'firstName lastName avatar'
  );

  if (!post) {
    res.status(404).json({ message: 'Статья не найдена' });
    return;
  }

  // Увеличить счётчик просмотров
  post.views += 1;
  await post.save();

  res.json({
    success: true,
    post,
  });
});

export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, excerpt, content, category, tags, featuredImage } = req.body;

  const slug = generateSlug(title);

  const post = await BlogPost.create({
    title,
    slug,
    excerpt,
    content,
    category,
    tags,
    featuredImage,
    author: req.user?._id,
  });

  res.status(201).json({
    success: true,
    post,
    message: 'Статья успешно создана',
  });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    res.status(404).json({ message: 'Статья не найдена' });
    return;
  }

  res.json({
    success: true,
    post,
    message: 'Статья успешно обновлена',
  });
});

export const publishPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    res.status(404).json({ message: 'Статья не найдена' });
    return;
  }

  post.isPublished = true;
  post.publishedAt = new Date();
  await post.save();

  res.json({
    success: true,
    post,
    message: 'Статья успешно опубликована',
  });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);

  if (!post) {
    res.status(404).json({ message: 'Статья не найдена' });
    return;
  }

  res.json({
    success: true,
    message: 'Статья успешно удалена',
  });
});

export const getAdminPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await BlogPost.find()
    .populate('author', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    posts,
  });
});
