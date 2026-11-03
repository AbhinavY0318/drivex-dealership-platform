import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestDriveService, STANDARD_TIME_SLOTS } from '../services/testDriveService.js';
import { connectDB, disconnectDB, clearDB } from '../config/db.js';
import { Showroom } from '../models/Showroom.js';
import { VehicleModel } from '../models/VehicleModel.js';
import { TestDriveBooking } from '../models/TestDriveBooking.js';

describe('Test Drive Booking & Double-Booking Prevention', () => {
  let testShowroom: any;
  let testModel: any;

  beforeAll(async () => {
    await connectDB();
    await clearDB();

    testShowroom = await Showroom.create({
      name: 'Hazratganj Flagship Test',
      code: 'HZG-TD-TEST',
      address: 'MG Marg, Hazratganj',
      city: 'Lucknow',
      pincode: '226001',
      phone: '9839000001',
      email: 'hzg.td@drivex.in',
      isActive: true,
    });

    testModel = await VehicleModel.create({
      name: 'Model H TD Test',
      slug: 'model-h-td-test',
      brand: 'DriveX',
      category: 'SUV',
      tagline: 'Test SUV',
      description: 'Testing TD',
      heroImage: 'test.jpg',
      startingPrice: 1245000,
      isActive: true,
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should list all slots with availability flags', async () => {
    const slots = await TestDriveService.getAvailableSlots(
      testShowroom._id.toString(),
      testModel._id.toString(),
      '2026-11-20'
    );

    expect(slots.length).toBe(STANDARD_TIME_SLOTS.length);
    expect(slots.every((s) => s.isAvailable)).toBe(true);
  });

  it('should reject bookings scheduled in the past', async () => {
    await expect(
      TestDriveService.bookSlot({
        customerName: 'Past Booker',
        customerPhone: '9876543210',
        customerEmail: 'past@example.com',
        vehicleModelId: testModel._id.toString(),
        showroomId: testShowroom._id.toString(),
        bookingDate: '2020-01-01', // Date in the past
        timeSlot: STANDARD_TIME_SLOTS[0],
      })
    ).rejects.toThrow('Test drive booking date cannot be in the past');
  });

  it('should successfully book a slot and prevent double-booking for the same showroom, model, date, and slot', async () => {
    const bookingDate = '2026-11-25';
    const timeSlot = '10:00 AM - 11:00 AM';

    // First booking: must succeed
    const firstBooking = await TestDriveService.bookSlot({
      customerName: 'First Customer',
      customerPhone: '9876543210',
      customerEmail: 'first@example.com',
      vehicleModelId: testModel._id.toString(),
      showroomId: testShowroom._id.toString(),
      bookingDate,
      timeSlot,
    });

    expect(firstBooking.bookingReference).toBeDefined();
    expect(firstBooking.status).toBe('CONFIRMED');

    // Slot should now show isAvailable: false
    const updatedSlots = await TestDriveService.getAvailableSlots(
      testShowroom._id.toString(),
      testModel._id.toString(),
      bookingDate
    );
    const bookedSlotInfo = updatedSlots.find((s) => s.timeSlot === timeSlot);
    expect(bookedSlotInfo?.isAvailable).toBe(false);

    // Second booking attempting same slot: must fail with collision error!
    await expect(
      TestDriveService.bookSlot({
        customerName: 'Collision Customer',
        customerPhone: '9876543299',
        customerEmail: 'collision@example.com',
        vehicleModelId: testModel._id.toString(),
        showroomId: testShowroom._id.toString(),
        bookingDate,
        timeSlot,
      })
    ).rejects.toThrow(/already been reserved/);
  });

  it('should release slot availability when booking is cancelled', async () => {
    const bookingDate = '2026-11-25';
    const timeSlot = '10:00 AM - 11:00 AM';

    const existing = await TestDriveBooking.findOne({ bookingDate, timeSlot });
    expect(existing).toBeDefined();

    await TestDriveService.updateBookingStatus(
      existing!._id.toString(),
      'CANCELLED',
      'Customer requested cancellation'
    );

    // Slot is now available again
    const slotsAfterCancel = await TestDriveService.getAvailableSlots(
      testShowroom._id.toString(),
      testModel._id.toString(),
      bookingDate
    );
    const slotInfo = slotsAfterCancel.find((s) => s.timeSlot === timeSlot);
    expect(slotInfo?.isAvailable).toBe(true);
  });
});
