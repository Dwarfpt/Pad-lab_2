import request from 'supertest';
import { app } from '../server';
import axios from 'axios';

// Мокаем axios
jest.mock('axios');
const mockedAxios = axios as jest.MockedFunction<typeof axios>;

describe('Gateway Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should proxy request to auth service', async () => {
        // Настраиваем мок ответа от микросервиса
        mockedAxios.mockResolvedValue({
            status: 200,
            data: { message: 'Success' },
            headers: { 'content-type': 'application/json' }
        });

        const res = await request(app).get('/api/auth/test');

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Success');

        // Проверяем, что axios был вызван с правильными параметрами
        expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
            method: 'GET',
            url: expect.stringContaining('/api/auth/test')
        }));
    });

    it('should handle service errors gracefully', async () => {
        // Мокаем ошибку сети
        mockedAxios.mockRejectedValue(new Error('Network Error'));

        const res = await request(app).get('/api/auth/test');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Service unavailable');
    });
});
