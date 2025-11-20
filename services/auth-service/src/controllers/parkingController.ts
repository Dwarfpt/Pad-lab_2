import { Request, Response } from 'express';
import Parking from '../models/Parking';
import ParkingSlot from '../models/ParkingSlot';
import { asyncHandler } from '../middleware/errorHandler';

export class ParkingController {
    private parkingSpots: any[]; // Replace with actual type

    constructor() {
        this.parkingSpots = [];
    }

    public getAvailableSpots(req: any, res: any) {
        const availableSpots = this.parkingSpots.filter(spot => !spot.isOccupied);
        res.json(availableSpots);
    }

    public updateSpot(req: any, res: any) {
        const { id, isOccupied } = req.body;
        const spot = this.parkingSpots.find(spot => spot.id === id);
        if (spot) {
            spot.isOccupied = isOccupied;
            res.status(200).json({ message: 'Spot updated successfully' });
        } else {
            res.status(404).json({ message: 'Spot not found' });
        }
    }

    public getStatistics(req: any, res: any) {
        const totalSpots = this.parkingSpots.length;
        const occupiedSpots = this.parkingSpots.filter(spot => spot.isOccupied).length;
        const statistics = {
            totalSpots,
            occupiedSpots,
            availableSpots: totalSpots - occupiedSpots
        };
        res.json(statistics);
    }
}

export const getAllParkings = asyncHandler(async (req: Request, res: Response) => {
  const parkings = await Parking.find({ isActive: true });

  res.json({
    success: true,
    parkings,
  });
});

export const getParkingById = asyncHandler(async (req: Request, res: Response) => {
  const parking = await Parking.findById(req.params.id);

  if (!parking) {
    res.status(404).json({ message: 'Парковка не найдена' });
    return;
  }

  const slots = await ParkingSlot.find({ parkingId: parking._id });

  res.json({
    success: true,
    parking,
    slots,
  });
});

export const createParking = asyncHandler(async (req: Request, res: Response) => {
  const parking = await Parking.create({
    ...req.body,
    availableSlots: req.body.totalSlots,
  });

  // Создание парковочных мест
  const slotsData = [];
  for (let i = 1; i <= req.body.totalSlots; i++) {
    slotsData.push({
      parkingId: parking._id,
      slotNumber: `A${i.toString().padStart(3, '0')}`,
      floor: Math.floor((i - 1) / 10),
      zone: 'A',
    });
  }

  await ParkingSlot.insertMany(slotsData);

  res.status(201).json({
    success: true,
    parking,
  });
});

export const updateParking = asyncHandler(async (req: Request, res: Response) => {
  const parking = await Parking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!parking) {
    res.status(404).json({ message: 'Парковка не найдена' });
    return;
  }

  res.json({
    success: true,
    parking,
  });
});

export const deleteParking = asyncHandler(async (req: Request, res: Response) => {
  const parking = await Parking.findByIdAndDelete(req.params.id);

  if (!parking) {
    res.status(404).json({ message: 'Парковка не найдена' });
    return;
  }

  await ParkingSlot.deleteMany({ parkingId: parking._id });

  res.json({
    success: true,
    message: 'Парковка успешно удалена',
  });
});

export const getParkingsByLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { lat, lng, radius = 5000 } = req.query;

    const parkings = await Parking.find({
      isActive: true,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
          },
          $maxDistance: parseInt(radius as string),
        },
      },
    });

    res.json({
      success: true,
      parkings,
    });
  }
);

// Получить занятые места парковки
export const getParkingOccupiedSpots = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const Booking = require('../models/Booking').default;
    
    // Получаем все активные бронирования для этой парковки
    const activeBookings = await Booking.find({
      parkingId: id,
      status: 'active',
      endTime: { $gte: new Date() }
    }).populate('slotId', 'slotNumber');
    
    // Формируем список занятых мест
    const occupiedSpots = activeBookings.map((booking: any) => ({
      spotNumber: booking.slotId?.slotNumber || booking.slotId?.toString(),
      bookingId: booking._id,
      endTime: booking.endTime
    }));
    
    res.json({
      success: true,
      occupiedSpots
    });
  }
);