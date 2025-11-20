import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { generateLoginQRCode } from '../services/qrCodeService';
import { sendVerificationEmail } from '../services/emailService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, language } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: 'Пользователь уже существует' });
    return;
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    language: language || 'en',
  });

  // Генерация QR кода для пользователя
  const qrCode = await generateLoginQRCode((user._id as mongoose.Types.ObjectId).toString());
  user.qrCode = qrCode;
  await user.save();

  const token = generateToken({
    id: (user._id as mongoose.Types.ObjectId).toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: (user._id as mongoose.Types.ObjectId).toString(),
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      qrCode: user.qrCode,
    },
    token,
    refreshToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401).json({ message: 'Неверные учетные данные' });
    return;
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    res.status(401).json({ message: 'Неверные учетные данные' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ message: 'Аккаунт неактивен' });
    return;
  }

  const token = generateToken({
    id: (user._id as mongoose.Types.ObjectId).toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: (user._id as mongoose.Types.ObjectId).toString(),
    email: user.email,
    role: user.role,
  });

  res.json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      qrCode: user.qrCode,
      language: user.language,
    },
    token,
    refreshToken,
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;

  res.json({
    success: true,
    user: {
      id: user?._id,
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      phone: user?.phone,
      role: user?.role,
      qrCode: user?.qrCode,
      language: user?.language,
      avatar: user?.avatar,
    },
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, phone, language } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { firstName, lastName, phone, language },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    user,
  });
});

export const generateQRCodeLogin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const qrCode = await generateLoginQRCode((req.user!._id as mongoose.Types.ObjectId).toString());

    await User.findByIdAndUpdate(req.user?._id, { qrCode });

    res.json({
      success: true,
      qrCode,
    });
  }
);
