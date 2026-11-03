import mongoose from 'mongoose';
import { TestDriveBooking, ITestDriveBooking, TestDriveStatus } from '../models/TestDriveBooking.js';
import { Showroom } from '../models/Showroom.js';
import { VehicleModel } from '../models/VehicleModel.js';
import { User } from '../models/User.js';

export const STANDARD_TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:30 AM - 12:30 PM',
  '02:00 PM - 03:00 PM',
  '03:30 PM - 04:30 PM',
  '05:00 PM - 06:00 PM',
];

export interface BookTestDriveInput {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleModelId: string;
  vehicleVariantId?: string;
  showroomId: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string;
  notes?: string;
}

export class TestDriveService {
  /**
   * Retrieves all slots for a given showroom, model, and date, indicating which slots are taken.
   */
  public static async getAvailableSlots(
    showroomId: string,
    vehicleModelId: string,
    bookingDate: string
  ): Promise<{ timeSlot: string; isAvailable: boolean }[]> {
    const existingBookings = await TestDriveBooking.find({
      showroomId: new mongoose.Types.ObjectId(showroomId),
      vehicleModelId: new mongoose.Types.ObjectId(vehicleModelId),
      bookingDate,
      status: { $in: ['PENDING', 'CONFIRMED'] },
    }).select('timeSlot');

    const bookedSlotsSet = new Set(existingBookings.map((b) => b.timeSlot));

    return STANDARD_TIME_SLOTS.map((slot) => ({
      timeSlot: slot,
      isAvailable: !bookedSlotsSet.has(slot),
    }));
  }

  /**
   * Atomically reserves a test-drive slot with double-booking prevention.
   */
  public static async bookSlot(input: BookTestDriveInput): Promise<ITestDriveBooking> {
    const {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      vehicleModelId,
      vehicleVariantId,
      showroomId,
      bookingDate,
      timeSlot,
      notes,
    } = input;

    // Validate date format YYYY-MM-DD and not in past
    const bookingDay = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(bookingDay.getTime())) {
      throw new Error('Invalid booking date format. Use YYYY-MM-DD');
    }
    if (bookingDay < today) {
      throw new Error('Test drive booking date cannot be in the past');
    }

    // Validate slot
    if (!STANDARD_TIME_SLOTS.includes(timeSlot)) {
      throw new Error(`Invalid time slot. Must be one of: ${STANDARD_TIME_SLOTS.join(', ')}`);
    }

    // Validate Showroom & VehicleModel
    const [showroom, model] = await Promise.all([
      Showroom.findById(showroomId),
      VehicleModel.findById(vehicleModelId),
    ]);

    if (!showroom || !showroom.isActive) {
      throw new Error('Selected showroom is invalid or inactive');
    }
    if (!model || !model.isActive) {
      throw new Error('Selected vehicle model is invalid or inactive');
    }

    // Check for concurrency collision / double booking
    const conflict = await TestDriveBooking.findOne({
      showroomId: new mongoose.Types.ObjectId(showroomId),
      vehicleModelId: new mongoose.Types.ObjectId(vehicleModelId),
      bookingDate,
      timeSlot,
      status: { $in: ['PENDING', 'CONFIRMED'] },
    });

    if (conflict) {
      throw new Error(
        `Selected slot "${timeSlot}" on ${bookingDate} has already been reserved at ${showroom.name}. Please select another time slot.`
      );
    }

    // Assign to a showroom consultant if available
    const consultant = await User.findOne({
      role: 'SALES_CONSULTANT',
      showroomId: showroom._id,
      isAvailable: true,
    }).sort({ activeLeadCount: 1 });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingReference = `TD-2026-${randomSuffix}`;

    const booking = new TestDriveBooking({
      bookingReference,
      customerId: customerId ? new mongoose.Types.ObjectId(customerId) : undefined,
      customerName,
      customerPhone,
      customerEmail,
      vehicleModelId: model._id,
      vehicleVariantId: vehicleVariantId ? new mongoose.Types.ObjectId(vehicleVariantId) : undefined,
      showroomId: showroom._id,
      bookingDate,
      timeSlot,
      status: 'CONFIRMED',
      consultantId: consultant ? consultant._id : undefined,
      notes,
      confirmedAt: new Date(),
    });

    await booking.save();
    return booking;
  }

  /**
   * Updates test drive status (CONFIRMED, COMPLETED, CANCELLED).
   */
  public static async updateBookingStatus(
    bookingId: string,
    status: TestDriveStatus,
    cancellationReason?: string
  ): Promise<ITestDriveBooking> {
    const booking = await TestDriveBooking.findById(bookingId);
    if (!booking) {
      throw new Error(`Test drive booking ${bookingId} not found`);
    }

    booking.status = status;
    if (status === 'CANCELLED') {
      booking.cancelledAt = new Date();
      booking.cancellationReason = cancellationReason || 'Cancelled by dealership/customer';
    }

    await booking.save();
    return booking;
  }
}
