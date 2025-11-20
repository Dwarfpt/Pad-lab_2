import mongoose, { Document, Schema } from 'mongoose';

export interface ITariff extends Document {
  name: string;
  description: string;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  price: number;
  currency: string;
  duration: number; // in minutes
  parkingId?: mongoose.Types.ObjectId;
  isActive: boolean;
  discountPercentage?: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const tariffSchema = new Schema<ITariff>(
  {
    name: {
      type: String,
      required: [true, 'Tariff name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    type: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      required: [true, 'Tariff type is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    parkingId: {
      type: Schema.Types.ObjectId,
      ref: 'Parking',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    features: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITariff>('Tariff', tariffSchema);
