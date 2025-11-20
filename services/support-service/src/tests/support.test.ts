import request from 'supertest';

// Мокаем nodemailer, чтобы избежать проблем с инициализацией в contactController
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test' })
    })
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
    },
    authorize: (...roles: string[]) => (req: any, res: any, next: any) => {
        next();
    },
    optionalAuth: (req: any, res: any, next: any) => {
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
