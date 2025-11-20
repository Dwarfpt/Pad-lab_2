import { Request, Response } from 'express';
import ParkingSlot from '../models/ParkingSlot';
import Parking from '../models/Parking';
import { asyncHandler } from '../middleware/errorHandler';
import { io } from '../server';

export const updateSensorData = asyncHandler(async (req: Request, res: Response) => {
  const { deviceId, parkingId, slots } = req.body;

  // Валидация входных данных
  if (!deviceId || !parkingId || !slots || !Array.isArray(slots)) {
    res.status(400).json({ 
      success: false,
      message: 'Отсутствуют обязательные поля: deviceId, parkingId, slots' 
    });
    return;
  }

  const parking = await Parking.findById(parkingId);
  if (!parking) {
    res.status(404).json({ 
      success: false,
      message: 'Парковка не найдена' 
    });
    return;
  }

  let availableCount = 0;
  const updatePromises = [];

  for (const slotData of slots) {
    if (!slotData.slotId) {
      console.warn('⚠️ Пропущен слот без slotId');
      continue;
    }

    const slotNumber = `A${slotData.slotId.toString().padStart(3, '0')}`;
    
    const updatePromise = ParkingSlot.findOneAndUpdate(
      { parkingId, slotNumber },
      {
        isOccupied: slotData.isOccupied,
        status: slotData.isOccupied ? 'occupied' : 'available',
        lastUpdated: new Date(),
        sensorId: deviceId,
      },
      { new: true, upsert: true }
    ).then(slot => {
      if (slot && !slotData.isOccupied) {
        availableCount++;
      }

      // Emit real-time update
      io.to(`parking-${parkingId}`).emit('slotUpdate', {
        parkingId,
        slotId: slot?._id,
        slotNumber: slot?.slotNumber,
        isOccupied: slot?.isOccupied,
        status: slot?.status,
      });

      return slot;
    });

    updatePromises.push(updatePromise);
  }

  await Promise.all(updatePromises);

  // Обновление доступных мест на парковке
  parking.availableSlots = availableCount;
  await parking.save();

  // Emit обновление парковки
  io.emit('parkingUpdate', {
    parkingId: parking._id,
    availableSlots: parking.availableSlots,
    totalSlots: parking.totalSlots,
  });

  res.json({
    success: true,
    message: 'Данные датчиков успешно обновлены',
    availableSlots: availableCount,
    totalSlots: parking.totalSlots,
  });
});

export const registerDevice = asyncHandler(async (req: Request, res: Response) => {
  const { deviceId, parkingId, type, slots: slotCount } = req.body;

  if (!deviceId || !parkingId) {
    res.status(400).json({ 
      success: false,
      message: 'Отсутствуют обязательные поля: deviceId, parkingId' 
    });
    return;
  }

  const parking = await Parking.findById(parkingId);
  if (!parking) {
    res.status(404).json({ 
      success: false,
      message: 'Парковка не найдена' 
    });
    return;
  }

  console.log(`✅ Устройство зарегистрировано: ${deviceId} для парковки ${parkingId}`);

  res.json({
    success: true,
    message: 'Устройство успешно зарегистрировано',
    deviceId,
    parkingId,
    serverTime: new Date().toISOString(),
  });
});
