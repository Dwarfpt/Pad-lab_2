import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { asyncHandler } from '../middleware/errorHandler';

export class UserController {
    async registerUser(req, res) {
        // Logic for registering a new user
    }

    async loginUser(req, res) {
        // Logic for user login
    }

    async getUserData(req, res) {
        // Logic for retrieving user data
    }
}

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;

  const query: any = {};
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .select('-password')
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  res.json({
    success: true,
    user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, phone, role, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { firstName, lastName, phone, role, isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  res.json({
    success: true,
    user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  res.json({
    success: true,
    message: 'Пользователь успешно удалён',
  });
});

export const getUserTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  const transactions = await Transaction.find({ userId })
    .populate('relatedBooking', 'parkingId slotId startTime endTime')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    transactions,
  });
});