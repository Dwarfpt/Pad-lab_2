import mongoose, { Document, Schema } from 'mongoose';

export interface IParking extends Document {
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number;
  isActive: boolean;
  openingHours: {
    open: string;
    close: string;
  };
  amenities: string[];
  images: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const parkingSchema = new Schema<IParking>(
  {
    name: {
      type: String,
      required: [true, 'Parking name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
    totalSlots: {
      type: Number,
      required: [true, 'Total slots is required'],
      min: 1,
    },
    availableSlots: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    openingHours: {
      open: {
        type: String,
        default: '00:00',
      },
      close: {
        type: String,
        default: '23:59',
      },
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
parkingSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IParking>('Parking', parkingSchema);