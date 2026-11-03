import mongoose, { Document, Schema } from 'mongoose';

export type TestDriveStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface ITestDriveBooking extends Document {
  bookingReference: string;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleModelId: mongoose.Types.ObjectId;
  vehicleVariantId?: mongoose.Types.ObjectId;
  showroomId: mongoose.Types.ObjectId;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '10:00 AM - 11:00 AM'
  status: TestDriveStatus;
  consultantId?: mongoose.Types.ObjectId;
  notes?: string;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestDriveBookingSchema = new Schema<ITestDriveBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    vehicleModelId: { type: Schema.Types.ObjectId, ref: 'VehicleModel', required: true, index: true },
    vehicleVariantId: { type: Schema.Types.ObjectId, ref: 'VehicleVariant' },
    showroomId: { type: Schema.Types.ObjectId, ref: 'Showroom', required: true, index: true },
    bookingDate: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    timeSlot: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    consultantId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    notes: { type: String },
    confirmedAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

// Compound unique index enforcing atomic double-booking prevention on active slots
TestDriveBookingSchema.index(
  { showroomId: 1, vehicleModelId: 1, bookingDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['PENDING', 'CONFIRMED'] } },
  }
);

export const TestDriveBooking = mongoose.model<ITestDriveBooking>('TestDriveBooking', TestDriveBookingSchema);
