import request from 'supertest';
import { app } from '../server';
import User from '../models/User';
import Transaction from '../models/Transaction';

// Мокаем модели
jest.mock('../models/User');
jest.mock('../models/Transaction');

// Мокаем middleware
jest.mock('../middleware/auth', () => ({
    protect: (req: any, res: any, next: any) => {
        req.user = { id: 'user_id', role: 'user' };
        next();
    },
    authorize: (...roles: string[]) => (req: any, res: any, next: any) => {
        next();
    }
}));

describe('Balance Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/balance/deposit', () => {
        it('should deposit balance successfully', async () => {
            const depositData = {
                amount: 100,
                currency: 'MDL',
                paymentMethod: 'card'
            };

            // Мокаем пользователя
            const mockUser = {
                _id: 'user_id',
                balance: { MDL: 0 },
                save: jest.fn().mockResolvedValue(true)
            };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            // Мокаем создание транзакции
            (Transaction.create as jest.Mock).mockResolvedValue({
                _id: 'transaction_id',
                ...depositData,
                status: 'completed'
            });

            const res = await request(app)
                .post('/api/balance/deposit')
                .send(depositData);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Баланс успешно пополнен');
            expect(res.body.balance).toBe(100); // 0 + 100
            expect(mockUser.balance.MDL).toBe(100);
            expect(mockUser.save).toHaveBeenCalled();
            expect(Transaction.create).toHaveBeenCalled();
        });

        it('should return 400 for invalid amount', async () => {
            const res = await request(app)
                .post('/api/balance/deposit')
                .send({ amount: -10, currency: 'MDL' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Некорректная сумма пополнения');
        });
    });
});
