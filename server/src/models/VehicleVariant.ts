import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicleColor {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface IVehicleVariant extends Document {
  modelId: mongoose.Types.ObjectId;
  name: string;
  variantCode: string;
  stockId: string;
  slug: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  transmission: 'Manual' | 'Automatic' | 'CVT' | 'DCT';
  exShowroomPrice: number;
  engineCapacityCc: number;
  powerBhp: number;
  torqueNm: number;
  mileageKmpl: number;
  seatingCapacity: number;
  colors: IVehicleColor[];
  features: string[];
  images: string[];
  isAvailable: boolean;
  stockCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleColorSchema = new Schema<IVehicleColor>(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const VehicleVariantSchema = new Schema<IVehicleVariant>(
  {
    modelId: { type: Schema.Types.ObjectId, ref: 'VehicleModel', required: true, index: true },
    name: { type: String, required: true, trim: true },
    variantCode: { type: String, required: true, trim: true },
    stockId: { type: String, required: true, unique: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'CNG', 'Electric'],
      required: true,
      index: true,
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic', 'CVT', 'DCT'],
      required: true,
      index: true,
    },
    exShowroomPrice: { type: Number, required: true, index: true },
    engineCapacityCc: { type: Number, required: true, default: 1498 },
    powerBhp: { type: Number, required: true, default: 120 },
    torqueNm: { type: Number, required: true, default: 145 },
    mileageKmpl: { type: Number, required: true, default: 18.0 },
    seatingCapacity: { type: Number, required: true, default: 5 },
    colors: [VehicleColorSchema],
    features: [{ type: String }],
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true, index: true },
    stockCount: { type: Number, default: 5 },
  },
  { timestamps: true }
);

// Compound indexes for catalog search & filtering
VehicleVariantSchema.index({ fuelType: 1, transmission: 1, exShowroomPrice: 1 });

export const VehicleVariant = mongoose.model<IVehicleVariant>('VehicleVariant', VehicleVariantSchema);
