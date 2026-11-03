import mongoose, { Document, Schema } from 'mongoose';

export interface IUsedVehicleInspection {
  rating: number;
  pointsInspected: number;
  accidentFree: boolean;
  tyresCondition: string;
  batteryCondition: string;
  engineCondition: string;
  bodyCondition: string;
  certifiedBy: string;
  inspectionDate: Date;
}

export interface IUsedVehicle extends Document {
  stockId: string;
  model: string;
  variant: string;
  year: number;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  transmission: 'Manual' | 'Automatic';
  kilometres: number;
  previousOwners: number;
  registrationNumber: string; // Full in database, masked in public APIs!
  askingPrice: number;
  color: string;
  images: string[];
  showroomId: mongoose.Types.ObjectId;
  status: 'Available' | 'Booked' | 'Sold';
  inspectionReport: IUsedVehicleInspection;
  isFeatured: boolean;
  suggestedPriceBand?: {
    min: number;
    max: number;
    median: number;
    sampleSize: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InspectionReportSchema = new Schema<IUsedVehicleInspection>(
  {
    rating: { type: Number, required: true, default: 4.8 },
    pointsInspected: { type: Number, required: true, default: 150 },
    accidentFree: { type: Boolean, required: true, default: true },
    tyresCondition: { type: String, default: '80% Tread Life' },
    batteryCondition: { type: String, default: 'Healthy' },
    engineCondition: { type: String, default: 'Certified Excellent' },
    bodyCondition: { type: String, default: 'Original Paint - No Structural Dents' },
    certifiedBy: { type: String, default: 'DriveX Certified Lab, Lucknow' },
    inspectionDate: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UsedVehicleSchema = new Schema<IUsedVehicle>(
  {
    stockId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },
    variant: { type: String, required: true, trim: true },
    year: { type: Number, required: true, index: true },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'CNG', 'Electric'],
      required: true,
      index: true,
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic'],
      required: true,
      index: true,
    },
    kilometres: { type: Number, required: true, index: true },
    previousOwners: { type: Number, required: true, default: 1 },
    registrationNumber: { type: String, required: true, trim: true },
    askingPrice: { type: Number, required: true, index: true },
    color: { type: String, required: true },
    images: [{ type: String }],
    showroomId: { type: Schema.Types.ObjectId, ref: 'Showroom', required: true, index: true },
    status: {
      type: String,
      enum: ['Available', 'Booked', 'Sold'],
      default: 'Available',
      index: true,
    },
    inspectionReport: { type: InspectionReportSchema, required: true },
    isFeatured: { type: Boolean, default: false, index: true },
    suggestedPriceBand: {
      min: { type: Number },
      max: { type: Number },
      median: { type: Number },
      sampleSize: { type: Number },
    },
  },
  { timestamps: true }
);

// Compound indexes for faceted used car search
UsedVehicleSchema.index({ askingPrice: 1, year: 1, kilometres: 1, fuelType: 1 });

export const UsedVehicle = mongoose.model<IUsedVehicle>('UsedVehicle', UsedVehicleSchema);
