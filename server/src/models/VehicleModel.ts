import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicleModel extends Document {
  name: string;
  slug: string;
  brand: string;
  category: 'SUV' | 'Sedan' | 'Hatchback' | 'Electric';
  tagline: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  startingPrice: number;
  launchYear: number;
  isFeatured: boolean;
  isActive: boolean;
  specSummary: {
    engine: string;
    power: string;
    transmission: string;
    mileage: string;
    bootSpace: string;
    groundClearance: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VehicleModelSchema = new Schema<IVehicleModel>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    brand: { type: String, required: true, default: 'DriveX' },
    category: {
      type: String,
      enum: ['SUV', 'Sedan', 'Hatchback', 'Electric'],
      required: true,
      index: true,
    },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    heroImage: { type: String, required: true },
    galleryImages: [{ type: String }],
    startingPrice: { type: Number, required: true, index: true },
    launchYear: { type: Number, required: true, default: 2026 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    specSummary: {
      engine: { type: String, default: '1.5L Turbo' },
      power: { type: String, default: '148 bhp' },
      transmission: { type: String, default: 'Automatic / Manual' },
      mileage: { type: String, default: '18.5 kmpl' },
      bootSpace: { type: String, default: '450 Litres' },
      groundClearance: { type: String, default: '190 mm' },
    },
  },
  { timestamps: true }
);

export const VehicleModel = mongoose.model<IVehicleModel>('VehicleModel', VehicleModelSchema);
