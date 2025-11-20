import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import Parking from '../models/Parking';
import ParkingSlot from '../models/ParkingSlot';
import Tariff from '../models/Tariff';
import User from '../models/User';
import Transaction from '../models/Transaction';
import QRCode from 'qrcode';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parkingId, spotNumber, slotId, tariffId, startTime, useFreeBooking } = req.body;
    const userId = (req as any).user?.id;

    console.log('📝 Booking request received:', { parkingId, spotNumber, slotId, tariffId, userId });

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Support both slotId (ObjectId) and spotNumber (string)
    let actualSlotId = slotId;
    
    if (!actualSlotId && spotNumber && parkingId) {
      console.log('🔍 Looking for slot with:', { parkingId, spotNumber });
      
      // Find slot by spotNumber if slotId not provided
      const slot = await ParkingSlot.findOne({ 
        parkingId, 
        slotNumber: spotNumber 
      });
      
      console.log('🎯 Found slot:', slot ? slot._id : 'NOT FOUND');
      
      if (slot) {
        actualSlotId = slot._id;
      } else {
        // Если не нашли по точному совпадению, попробуем создать слот
        console.log('⚠️ Slot not found, attempting to create one');
        try {
          const newSlot = await ParkingSlot.create({
            parkingId,
            slotNumber: spotNumber,
            floor: 0,
            zone: 'A',
            type: 'standard',
            status: 'available',
            isOccupied: false,
            isReserved: false,
            lastUpdated: new Date()
          });
          actualSlotId = newSlot._id;
          console.log('✅ Created new slot:', actualSlotId);
        } catch (createError) {
          console.error('❌ Failed to create slot:', createError);
        }
      }
    }

    if (!actualSlotId) {
      console.error('❌ No slot ID found or created');
      return res.status(400).json({ 
        message: 'ID места парковки не указан',
        details: 'Не удалось найти или создать слот с номером ' + spotNumber
      });
    }

    // Получаем пользователя
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем наличие парковки
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ message: 'Парковка не найдена' });
    }

    // Проверяем тариф
    const tariff = await Tariff.findById(tariffId);
    if (!tariff) {
      return res.status(404).json({ message: 'Тариф не найден' });
    }

    // Проверка бесплатного бронирования
    let isFreeBooking = false;
    let bookingDuration = tariff.duration;
    let bookingPrice = tariff.price;

    if (useFreeBooking && !user.hasUsedFreeBooking) {
      // Первое бронирование бесплатно на 1 час
      isFreeBooking = true;
      bookingDuration = 60; // 1 час в минутах
      bookingPrice = 0;
    }

    // Вычисляем endTime на основе тарифа или бесплатного часа
    const start = new Date(startTime || Date.now());
    const end = new Date(start.getTime() + bookingDuration * 60000);

    // Проверяем доступность места
    const existingBooking = await Booking.findOne({
      parkingId: parkingId,
      slotId: actualSlotId,
      status: 'active',
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Место уже занято на это время' });
    }

    // Создаем бронирование
    const booking = await Booking.create({
      userId: userId,
      parkingId: parkingId,
      slotId: actualSlotId,
      startTime: start,
      endTime: end,
      status: 'active',
      totalPrice: bookingPrice,
      paymentStatus: 'paid',
    });

    // Списываем средства с баланса и создаем транзакцию
    if (bookingPrice > 0) {
      const currency = (tariff.currency as 'USD' | 'EUR' | 'MDL') || 'MDL';
      
      // Проверяем достаточность средств в нужной валюте
      if (user.balance[currency] < bookingPrice) {
        return res.status(400).json({ 
          message: 'Недостаточно средств на балансе',
          required: bookingPrice,
          available: user.balance[currency],
          currency: currency
        });
      }

      // Списываем средства с баланса в нужной валюте
      user.balance[currency] -= bookingPrice;
      await user.save();

      const slotInfo = await ParkingSlot.findById(actualSlotId);
      const slotNumber = slotInfo?.slotNumber || spotNumber || 'N/A';
      
      await Transaction.create({
        userId: userId,
        type: 'payment',
        amount: bookingPrice,
        currency: tariff.currency || 'MDL',
        status: 'completed',
        description: `🅿️ Бронирование места ${slotNumber} (${parking.name}) - ${tariff.name}`,
        paymentMethod: 'balance',
        relatedBooking: booking._id,
      });
      
      console.log('✅ Balance deducted and transaction created for booking:', booking._id);
    } else if (isFreeBooking) {
      // Создаем запись о бесплатном бронировании
      const slotInfo = await ParkingSlot.findById(actualSlotId);
      const slotNumber = slotInfo?.slotNumber || spotNumber || 'N/A';
      
      await Transaction.create({
        userId: userId,
        type: 'refund',
        amount: 0,
        currency: tariff.currency || 'MDL',
        status: 'completed',
        description: `🎉 Бесплатное бронирование места ${slotNumber} (${parking.name})`,
        paymentMethod: 'free',
        relatedBooking: booking._id,
      });
      
      console.log('✅ Free booking transaction created');
    }

    // Если использовали бесплатное бронирование, помечаем пользователя
    if (isFreeBooking) {
      user.hasUsedFreeBooking = true;
      await user.save();
    }

    // Генерируем QR-код
    const qrCode = await QRCode.toDataURL(booking._id.toString());

    // Обновляем доступность парковки
    if (parking.availableSlots > 0) {
      parking.availableSlots -= 1;
      await parking.save();
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('parkingId', 'name address')
      .populate('userId', 'firstName lastName email');

    res.status(201).json({
      booking: populatedBooking,
      qrCode,
      isFreeBooking,
      message: isFreeBooking ? '🎉 Первый час бесплатно!' : 'Бронирование успешно создано',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const bookings = await Booking.find({ userId })
      .populate('parkingId', 'name address')
      .populate('slotId', 'slotNumber')
      .sort({ createdAt: -1 });

    // Форматируем данные для фронтенда
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      parking: {
        name: (booking.parkingId as any)?.name || 'Неизвестная парковка',
        address: (booking.parkingId as any)?.address || 'Адрес не указан'
      },
      spot: (booking.slotId as any)?.slotNumber || booking.slotId?.toString() || 'Неизвестное место',
      tariff: {
        name: 'Стандартный тариф', // Пока фиксированное значение
        price: booking.totalPrice
      },
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      totalPrice: booking.totalPrice
    }));

    res.json({ bookings: formattedBookings });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, parkingId } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (parkingId) {
      filter.parkingId = parkingId;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('parkingId', 'name address')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('userId', 'firstName lastName email phone')
      .populate('parkingId', 'name address');

    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const booking = await Booking.findById(id)
      .populate('parkingId', 'name')
      .populate('slotId', 'slotNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    // Проверяем права доступа
    if (booking.userId.toString() !== userId && (req as any).user?.role !== 'super-admin') {
      return res.status(403).json({ message: 'Нет прав для отмены этого бронирования' });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ message: 'Бронирование уже завершено или отменено' });
    }

    // Возврат средств, если было платное бронирование
    if (booking.totalPrice > 0 && booking.paymentStatus === 'paid') {
      const user = await User.findById(userId);
      if (user) {
        // Возвращаем средства на баланс (в MDL по умолчанию)
        user.balance.MDL += booking.totalPrice;
        await user.save();

        // Создаем транзакцию возврата
        const slotNumber = (booking.slotId as any)?.slotNumber || 'N/A';
        const parkingName = (booking.parkingId as any)?.name || 'Парковка';
        
        await Transaction.create({
          userId: userId,
          type: 'refund',
          amount: booking.totalPrice,
          currency: 'MDL',
          status: 'completed',
          description: `💰 Возврат за отмену бронирования места ${slotNumber} (${parkingName})`,
          paymentMethod: 'refund',
          relatedBooking: booking._id,
        });

        console.log(`✅ Refunded ${booking.totalPrice} MDL to user ${userId}`);
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    // Возвращаем место в парковку
    const parking = await Parking.findById(booking.parkingId);
    if (parking) {
      parking.availableSlots += 1;
      await parking.save();
    }

    res.json({ 
      message: booking.totalPrice > 0 
        ? `Бронирование отменено. Возвращено ${booking.totalPrice} MDL на баланс.` 
        : 'Бронирование отменено',
      booking 
    });
  } catch (error) {
    next(error);
  }
};

export const completeBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    booking.status = 'completed';
    await booking.save();

    // Возвращаем место в парковку
    const parking = await Parking.findById(booking.parkingId);
    if (parking) {
      parking.availableSlots += 1;
      await parking.save();
    }

    res.json({ message: 'Бронирование завершено', booking });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await Booking.findByIdAndUpdate(id, updates, { new: true })
      .populate('userId', 'firstName lastName email')
      .populate('parkingId', 'name address');

    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};
