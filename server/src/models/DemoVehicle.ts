import mongoose, { Document, Schema } from 'mongoose';

export interface IDemoVehicle extends Document {
  showroomId: mongoose.Types.ObjectId;
  vehicleModelId: mongoose.Types.ObjectId;
  vehicleVariantId?: mongoose.Types.ObjectId;
  registrationNumber: string;
  isAvailable: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DemoVehicleSchema = new Schema<IDemoVehicle>(
  {
    showroomId: { type: Schema.Types.ObjectId, ref: 'Showroom', required: true, index: true },
    vehicleModelId: { type: Schema.Types.ObjectId, ref: 'VehicleModel', required: true, index: true },
    vehicleVariantId: { type: Schema.Types.ObjectId, ref: 'VehicleVariant' },
    registrationNumber: { type: String, required: true, trim: true },
    isAvailable: { type: Boolean, default: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const DemoVehicle = mongoose.model<IDemoVehicle>('DemoVehicle', DemoVehicleSchema);
