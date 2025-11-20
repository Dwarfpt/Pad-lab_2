import request from 'supertest';

// Мокаем контроллер контактов, чтобы избежать проблем с зависимостями
jest.mock('../controllers/contactController', () => ({
    createSupportMessage: (req: any, res: any, next: any) => res.status(201).json({ message: 'Mocked' }),
    getUserSupportChats: (req: any, res: any, next: any) => res.json({ chats: [] }),
    getSupportChatById: (req: any, res: any, next: any) => res.json({ chat: {} }),
    addMessageToChat: (req: any, res: any, next: any) => res.json({ message: 'Mocked' }),
    getAllSupportChats: (req: any, res: any, next: any) => res.json({ chats: [] }),
    updateChatStatus: (req: any, res: any, next: any) => res.json({ message: 'Mocked' }),
}));

import { app } from '../server';

// Мокаем middleware
jest.mock('../middleware/auth', () => ({
    protect: (req: any, res: any, next: any) => {
        req.user = {
            id: 'user_id',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            role: 'user'
        };
        next();
    },
    admin: (req: any, res: any, next: any) => {
        next();
    }
}));

describe('Support Controller', () => {
    describe('GET /api/support/tickets', () => {
        it('should return all tickets', async () => {
            const res = await request(app).get('/api/support/tickets');

            expect(res.status).toBe(200);
            expect(res.body.tickets).toBeDefined();
            expect(Array.isArray(res.body.tickets)).toBe(true);
        });
    });

    describe('POST /api/support/tickets', () => {
        it('should create a new ticket', async () => {
            const ticketData = {
                subject: 'Test Ticket',
                message: 'Help me please',
                priority: 'high'
            };

            const res = await request(app)
                .post('/api/support/tickets')
                .send(ticketData);

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Обращение создано');
            expect(res.body.ticket.subject).toBe('Test Ticket');
            expect(res.body.ticket.userId).toBe('user_id');
        });
    });
});
