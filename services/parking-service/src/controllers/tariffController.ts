import { Request, Response } from 'express';
import Tariff from '../models/Tariff';
import { asyncHandler } from '../middleware/errorHandler';

export const getAllTariffs = asyncHandler(async (req: Request, res: Response) => {
  const tariffs = await Tariff.find({ isActive: true }).sort({ price: 1 });

  res.json({
    success: true,
    tariffs,
  });
});

export const getTariffById = asyncHandler(async (req: Request, res: Response) => {
  const tariff = await Tariff.findById(req.params.id);

  if (!tariff) {
    res.status(404).json({ message: 'Тариф не найден' });
    return;
  }

  res.json({
    success: true,
    tariff,
  });
});

export const createTariff = asyncHandler(async (req: Request, res: Response) => {
  const tariff = await Tariff.create(req.body);

  res.status(201).json({
    success: true,
    tariff,
    message: 'Тариф успешно создан',
  });
});

export const updateTariff = asyncHandler(async (req: Request, res: Response) => {
  const tariff = await Tariff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tariff) {
    res.status(404).json({ message: 'Тариф не найден' });
    return;
  }

  res.json({
    success: true,
    tariff,
    message: 'Тариф успешно обновлён',
  });
});

export const deleteTariff = asyncHandler(async (req: Request, res: Response) => {
  const tariff = await Tariff.findByIdAndDelete(req.params.id);

  if (!tariff) {
    res.status(404).json({ message: 'Тариф не найден' });
    return;
  }

  res.json({
    success: true,
    message: 'Тариф успешно удалён',
  });
});
