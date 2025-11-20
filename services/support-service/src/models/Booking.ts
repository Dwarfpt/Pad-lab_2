import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  parkingId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  actualEndTime?: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  vehicleNumber?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parkingId: {
      type: Schema.Types.ObjectId,
      ref: 'Parking',
      required: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'ParkingSlot',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    actualEndTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'pending',
    },
    vehicleNumber: {
      type: String,
    },
    qrCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ parkingId: 1, status: 1 });

export default mongoose.model<IBooking>('Booking', bookingSchema);
