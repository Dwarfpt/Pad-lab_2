import mongoose, { Document, Schema } from 'mongoose';

export interface IParkingSlot extends Document {
  parkingId: mongoose.Types.ObjectId;
  slotNumber: string;
  floor: number;
  zone: string;
  isOccupied: boolean;
  isReserved: boolean;
  reservedBy?: mongoose.Types.ObjectId;
  reservedUntil?: Date;
  type: 'standard' | 'disabled' | 'electric' | 'family';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  sensorId?: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const parkingSlotSchema = new Schema<IParkingSlot>(
  {
    parkingId: {
      type: Schema.Types.ObjectId,
      ref: 'Parking',
      required: true,
    },
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor is required'],
      default: 0,
    },
    zone: {
      type: String,
      default: 'A',
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    isReserved: {
      type: Boolean,
      default: false,
    },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reservedUntil: {
      type: Date,
    },
    type: {
      type: String,
      enum: ['standard', 'disabled', 'electric', 'family'],
      default: 'standard',
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
    sensorId: {
      type: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index
parkingSlotSchema.index({ parkingId: 1, slotNumber: 1 }, { unique: true });

export default mongoose.model<IParkingSlot>('ParkingSlot', parkingSlotSchema);
