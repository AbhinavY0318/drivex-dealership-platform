import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'BUYER' | 'SALES_CONSULTANT' | 'ADMIN';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone: string;
  showroomId?: mongoose.Types.ObjectId;
  activeLeadCount: number;
  isAvailable: boolean;
  lastAssignedAt?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['BUYER', 'SALES_CONSULTANT', 'ADMIN'],
      default: 'BUYER',
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    showroomId: { type: Schema.Types.ObjectId, ref: 'Showroom', index: true },
    activeLeadCount: { type: Number, default: 0, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    lastAssignedAt: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

// Compound index for consultant workload lookups
UserSchema.index({ role: 1, showroomId: 1, isAvailable: 1, activeLeadCount: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
