import request from 'supertest';
import { app } from '../server';
import User from '../models/User';
import * as jwtUtils from '../utils/jwt';
import * as qrService from '../services/qrCodeService';

// Мокаем зависимости
jest.mock('../models/User');
jest.mock('../utils/jwt');
jest.mock('../services/qrCodeService');

describe('Auth Controller - Register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        // Данные для регистрации
        const userData = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            phone: '1234567890'
        };

        // Настраиваем моки
        (User.findOne as jest.Mock).mockResolvedValue(null); // Пользователь не существует
        (User.create as jest.Mock).mockResolvedValue({
            _id: 'mocked_id',
            ...userData,
            role: 'user',
            save: jest.fn().mockResolvedValue(true)
        });
        (qrService.generateLoginQRCode as jest.Mock).mockResolvedValue('mocked_qr_code');
        (jwtUtils.generateToken as jest.Mock).mockReturnValue('mocked_token');
        (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue('mocked_refresh_token');

        // Выполняем запрос
        const res = await request(app)
            .post('/api/auth/register')
            .send(userData);

        // Проверки
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBe('mocked_token');
        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            email: userData.email,
            firstName: userData.firstName
        }));
    });

    it('should return 400 if user already exists', async () => {
        // Мокаем, что пользователь уже есть
        (User.findOne as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'existing@example.com',
                password: '123'
            });

        expect(res.status).toBe(400);
        // expect(res.body.message).toBe('Пользователь уже существует');
    });
});
