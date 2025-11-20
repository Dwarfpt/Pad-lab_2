import request from 'supertest';
import { app } from '../server';
import Parking from '../models/Parking';
import ParkingSlot from '../models/ParkingSlot';

// Мокаем модели
jest.mock('../models/Parking');
jest.mock('../models/ParkingSlot');

// Мокаем middleware
jest.mock('../middleware/auth', () => ({
    protect: (req: any, res: any, next: any) => {
        req.user = { id: 'admin_id', role: 'admin' };
        next();
    },
    admin: (req: any, res: any, next: any) => {
        next();
    },
    authorize: (...roles: string[]) => (req: any, res: any, next: any) => {
        next();
    },
    deviceAuth: (req: any, res: any, next: any) => {
        next();
    }
}));

describe('Parking Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/parkings', () => {
        it('should return all active parkings', async () => {
            const mockParkings = [
                { name: 'Parking 1', isActive: true },
                { name: 'Parking 2', isActive: true }
            ];

            (Parking.find as jest.Mock).mockResolvedValue(mockParkings);

            const res = await request(app).get('/api/parkings');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.parkings).toHaveLength(2);
            expect(Parking.find).toHaveBeenCalledWith({ isActive: true });
        });
    });

    describe('POST /api/parkings', () => {
        it('should create a new parking and slots', async () => {
            const parkingData = {
                name: 'New Parking',
                address: '123 Street',
                totalSlots: 5,
                pricePerHour: 10
            };

            (Parking.create as jest.Mock).mockResolvedValue({
                _id: 'new_parking_id',
                ...parkingData,
                availableSlots: 5
            });

            (ParkingSlot.insertMany as jest.Mock).mockResolvedValue([]);

            const res = await request(app)
                .post('/api/parkings')
                .send(parkingData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(Parking.create).toHaveBeenCalled();
            expect(ParkingSlot.insertMany).toHaveBeenCalled();
            // Проверяем, что insertMany был вызван с правильным количеством слотов (5)
            expect((ParkingSlot.insertMany as jest.Mock).mock.calls[0][0]).toHaveLength(5);
        });
    });
});
