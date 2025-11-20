import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportChat extends Document {
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: {
    sender: 'user' | 'support';
    message: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const supportChatSchema = new Schema<ISupportChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ['user', 'support'],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Индексы для быстрого поиска
supportChatSchema.index({ userEmail: 1 });
supportChatSchema.index({ status: 1 });
supportChatSchema.index({ createdAt: -1 });

export default mongoose.model<ISupportChat>('SupportChat', supportChatSchema);