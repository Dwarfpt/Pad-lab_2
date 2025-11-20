import mongoose, { Document, Schema } from 'mongoose';

export interface ISensorData extends Document {
  id: number;
  location: string;
  isOccupied: boolean;
  parkingId?: mongoose.Types.ObjectId;
  slotId?: mongoose.Types.ObjectId;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sensorDataSchema = new Schema<ISensorData>(
  {
    id: {
      type: Number,
      required: [true, 'Sensor ID is required'],
      unique: true,
    },
    location: {
      type: String,
      required: [true, 'Sensor location is required'],
      trim: true,
    },
    isOccupied: {
      type: Boolean,
      required: true,
      default: false,
    },
    parkingId: {
      type: Schema.Types.ObjectId,
      ref: 'Parking',
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'ParkingSlot',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
sensorDataSchema.index({ location: 1, timestamp: -1 });
sensorDataSchema.index({ parkingId: 1, isOccupied: 1 });

export default mongoose.model<ISensorData>('SensorData', sensorDataSchema);

// Export interface for compatibility with existing code
export interface SensorData {
  id: number;
  location: string;
  isOccupied: boolean;
  parkingId?: string;
  slotId?: string;
  timestamp?: Date;
}