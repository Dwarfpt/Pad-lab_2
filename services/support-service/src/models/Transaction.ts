import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  currency: 'USD' | 'EUR' | 'MDL';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  paymentMethod?: 'card' | 'paypal' | 'cash' | 'bank_transfer' | 'refund' | 'balance' | 'free';
  paymentDetails?: any;
  relatedBooking?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'payment', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'MDL'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    description: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'paypal', 'cash', 'bank_transfer', 'refund', 'balance', 'free'],
    },
    paymentDetails: {
      type: Schema.Types.Mixed,
    },
    relatedBooking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
  },
  {
    timestamps: true,
  }
);

// Index for user transactions
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
