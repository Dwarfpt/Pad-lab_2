import request from 'supertest';
import { app } from '../server';
import Booking from '../models/Booking';
import Parking from '../models/Parking';
import ParkingSlot from '../models/ParkingSlot';
import Tariff from '../models/Tariff';
import User from '../models/User';
import Transaction from '../models/Transaction';
import QRCode from 'qrcode';

// Мокаем все модели
jest.mock('../models/Booking');
jest.mock('../models/Parking');
jest.mock('../models/ParkingSlot');
jest.mock('../models/Tariff');
jest.mock('../models/User');
jest.mock('../models/Transaction');
jest.mock('qrcode');

// Мокаем middleware
jest.mock('../middleware/auth', () => ({
    protect: (req: any, res: any, next: any) => {
        req.user = { id: 'user_id', role: 'user' };
        next();
    }
}));

describe('Booking Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/bookings', () => {
        it('should create a booking successfully', async () => {
            const bookingData = {
                parkingId: 'parking_id',
                spotNumber: 'A1',
                tariffId: 'tariff_id',
                startTime: new Date().toISOString(),
                useFreeBooking: false
            };

            // Мокаем поиск слота
            (ParkingSlot.findOne as jest.Mock).mockResolvedValue({ _id: 'slot_id' });

            // Мокаем пользователя
            (User.findById as jest.Mock).mockResolvedValue({
                _id: 'user_id',
                balance: { MDL: 100 },
                save: jest.fn().mockResolvedValue(true)
            });

            // Мокаем парковку
            (Parking.findById as jest.Mock).mockResolvedValue({
                _id: 'parking_id',
                name: 'Test Parking',
                availableSlots: 10,
                save: jest.fn().mockResolvedValue(true)
            });

            // Мокаем тариф
            (Tariff.findById as jest.Mock).mockResolvedValue({
                _id: 'tariff_id',
                price: 50,
                duration: 60,
                currency: 'MDL'
            });

            // Мокаем отсутствие существующего бронирования
            (Booking.findOne as jest.Mock).mockResolvedValue(null);

            // Мокаем создание бронирования
            const mockBooking = {
                _id: 'booking_id',
                ...bookingData,
                save: jest.fn().mockResolvedValue(true)
            };

            // Настраиваем populate для возвращаемого значения
            const mockPopulate = jest.fn().mockReturnThis();
            (Booking.create as jest.Mock).mockResolvedValue(mockBooking);
            (Booking.findById as jest.Mock).mockReturnValue({
                populate: mockPopulate.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockBooking)
                })
            });

            (QRCode.toDataURL as jest.Mock).mockResolvedValue('qr_code_data');

            const res = await request(app)
                .post('/api/bookings')
                .send(bookingData);

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Бронирование успешно создано');
            expect(Booking.create).toHaveBeenCalled();
            expect(Transaction.create).toHaveBeenCalled(); // Должна создаться транзакция
        });
    });
});
