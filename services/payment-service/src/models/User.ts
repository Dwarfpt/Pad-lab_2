import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'user' | 'admin' | 'super-admin';
  isActive: boolean;
  isEmailVerified: boolean;
  qrCode?: string;
  avatar?: string;
  language: 'en' | 'ru' | 'ro';
  balance: {
    USD: number;
    EUR: number;
    MDL: number;
  };
  preferredCurrency: 'USD' | 'EUR' | 'MDL';
  hasUsedFreeBooking: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super-admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    qrCode: {
      type: String,
    },
    avatar: {
      type: String,
    },
    language: {
      type: String,
      enum: ['en', 'ru', 'ro'],
      default: 'en',
    },
    balance: {
      USD: {
        type: Number,
        default: 0,
        min: 0,
      },
      EUR: {
        type: Number,
        default: 0,
        min: 0,
      },
      MDL: {
        type: Number,
        default: 0,
        min: 0,
      },
      // RUB удалён - используйте только MDL, USD, EUR
    },
    preferredCurrency: {
      type: String,
      enum: ['USD', 'EUR', 'MDL'], // Только поддерживаемые валюты
      default: 'MDL',
    },
    hasUsedFreeBooking: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);