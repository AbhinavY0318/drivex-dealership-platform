import mongoose, { Document, Schema } from 'mongoose';

export interface ICityPricing extends Document {
  city: string;
  state: string;
  vehicleModelId: mongoose.Types.ObjectId;
  vehicleVariantId: mongoose.Types.ObjectId;
  exShowroomPrice: number;
  rtoRoadTax: number;
  insurance: number;
  tcsAmount: number;
  mandatoryAccessories: number;
  registrationAndFastag: number;
  offersDiscount: number;
  priceValidityDate: Date;
  disclaimer: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CityPricingSchema = new Schema<ICityPricing>(
  {
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, default: 'Uttar Pradesh', trim: true },
    vehicleModelId: { type: Schema.Types.ObjectId, ref: 'VehicleModel', required: true, index: true },
    vehicleVariantId: { type: Schema.Types.ObjectId, ref: 'VehicleVariant', required: true, index: true },
    exShowroomPrice: { type: Number, required: true },
    rtoRoadTax: { type: Number, required: true },
    insurance: { type: Number, required: true },
    tcsAmount: { type: Number, default: 0 },
    mandatoryAccessories: { type: Number, default: 15000 },
    registrationAndFastag: { type: Number, default: 2500 },
    offersDiscount: { type: Number, default: 0 },
    priceValidityDate: { type: Date, required: true },
    disclaimer: {
      type: String,
      default:
        'Demonstration on-road estimate for simulation purposes only. Final road tax, insurance, and statutory charges are determined by Lucknow RTO and insurer at the time of final invoicing.',
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Compound index for fast city + variant lookup
CityPricingSchema.index({ city: 1, vehicleVariantId: 1, isActive: 1 }, { unique: true });

export const CityPricing = mongoose.model<ICityPricing>('CityPricing', CityPricingSchema);
