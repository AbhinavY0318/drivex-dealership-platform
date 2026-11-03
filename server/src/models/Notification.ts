import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'LEAD_ASSIGNED' | 'SLA_ALERT' | 'BOOKING_CONFIRMED' | 'SYSTEM';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['LEAD_ASSIGNED', 'SLA_ALERT', 'BOOKING_CONFIRMED', 'SYSTEM'],
      default: 'SYSTEM',
      index: true,
    },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
