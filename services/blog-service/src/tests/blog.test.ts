import request from 'supertest';
import { app } from '../server';
import BlogPost from '../models/BlogPost';
import * as authMiddleware from '../middleware/auth';

// Мокаем модель
jest.mock('../models/BlogPost');

// Мокаем middleware аутентификации
jest.mock('../middleware/auth', () => ({
    protect: (req: any, res: any, next: any) => {
        req.user = { _id: 'mock_user_id', role: 'admin' };
        next();
    },
    admin: (req: any, res: any, next: any) => {
        next();
    },
    authorize: (...roles: string[]) => (req: any, res: any, next: any) => {
        next();
    }
}));

describe('Blog Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/blog/posts', () => {
        it('should return a list of posts', async () => {
            const mockPosts = [
                { title: 'Post 1', isPublished: true },
                { title: 'Post 2', isPublished: true }
            ];

            // Мокаем цепочку вызовов Mongoose
            const mockFind = {
                populate: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockPosts)
            };

            (BlogPost.find as jest.Mock).mockReturnValue(mockFind);
            (BlogPost.countDocuments as jest.Mock).mockResolvedValue(2);

            const res = await request(app).get('/api/blog');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.posts).toHaveLength(2);
            expect(BlogPost.find).toHaveBeenCalledWith({ isPublished: true });
        });
    });

    describe('POST /api/blog/posts', () => {
        it('should create a new post', async () => {
            const postData = {
                title: 'New Post',
                content: 'Content here',
                category: 'Tech'
            };

            // Мокаем проверку слага (что такой еще не существует)
            (BlogPost.findOne as jest.Mock).mockResolvedValue(null);

            (BlogPost.create as jest.Mock).mockResolvedValue({
                _id: 'new_post_id',
                ...postData,
                slug: 'new-post',
                author: 'mock_user_id'
            });

            const res = await request(app)
                .post('/api/blog')
                .send(postData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.post.title).toBe('New Post');
        });
    });
});
