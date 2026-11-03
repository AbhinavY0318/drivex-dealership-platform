import mongoose, { Document, Schema } from 'mongoose';

export interface IShowroom extends Document {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  operatingHours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShowroomSchema = new Schema<IShowroom>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    address: { type: String, required: true },
    city: { type: String, required: true, default: 'Lucknow', index: true },
    state: { type: String, required: true, default: 'Uttar Pradesh' },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    operatingHours: { type: String, default: '09:30 AM - 07:30 PM (Mon-Sun)' },
    coordinates: {
      lat: { type: Number, default: 26.8467 },
      lng: { type: Number, default: 80.9462 },
    },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Showroom = mongoose.model<IShowroom>('Showroom', ShowroomSchema);
