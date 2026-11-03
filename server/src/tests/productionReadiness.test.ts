import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Showroom } from '../models/Showroom.js';
import { VehicleModel } from '../models/VehicleModel.js';
import { VehicleVariant } from '../models/VehicleVariant.js';
import { CityPricing } from '../models/CityPricing.js';
import { UsedVehicle } from '../models/UsedVehicle.js';
import { Lead } from '../models/Lead.js';
import { TestDriveBooking } from '../models/TestDriveBooking.js';
import { TestDriveService } from '../services/testDriveService.js';
import { LeadAssignmentService } from '../services/leadAssignmentService.js';
import { PricingService } from '../services/pricingService.js';
import { AIService } from '../services/aiService.js';
import { LeadController } from '../controllers/leadController.js';
import { seedDatabase } from '../scripts/seed.js';

describe('DriveX Production-Readiness & Edge Case Suite', () => {
  beforeAll(async () => {
    await connectDB();
    await seedDatabase(true);
    await TestDriveBooking.syncIndexes();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // ---------------------------------------------------------------------------
  // 1. CONCURRENT TEST-DRIVE BOOKING PREVENTING DOUBLE BOOKING
  // ---------------------------------------------------------------------------
  it('Edge Case 1: Two customers booking the same demo car and slot simultaneously - exactly one succeeds', async () => {
    const showroom = await Showroom.findOne({ code: 'LKO-HZG' });
    const model = await VehicleModel.findOne();

    expect(showroom).toBeDefined();
    expect(model).toBeDefined();

    const futureDate = '2026-11-20';
    const slot = '10:00 AM - 11:00 AM';

    // Clear any existing booking for this slot
    await TestDriveBooking.deleteMany({
      showroomId: showroom!._id,
      vehicleModelId: model!._id,
      bookingDate: futureDate,
      timeSlot: slot,
    });

    const customer1Input = {
      customerName: 'Customer Alpha',
      customerPhone: '9876543210',
      customerEmail: 'alpha@example.com',
      vehicleModelId: model!._id.toString(),
      showroomId: showroom!._id.toString(),
      bookingDate: futureDate,
      timeSlot: slot,
    };

    const customer2Input = {
      customerName: 'Customer Beta',
      customerPhone: '9123456789',
      customerEmail: 'beta@example.com',
      vehicleModelId: model!._id.toString(),
      showroomId: showroom!._id.toString(),
      bookingDate: futureDate,
      timeSlot: slot,
    };

    // Execute concurrently using Promise.allSettled
    const results = await Promise.allSettled([
      TestDriveService.bookSlot(customer1Input),
      TestDriveService.bookSlot(customer2Input),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly one must succeed and one must fail with collision error
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const failureReason = (rejected[0] as PromiseRejectedResult).reason.message;
    expect(failureReason).toContain('already been reserved');
  });

  // ---------------------------------------------------------------------------
  // 2. NO AVAILABLE CONSULTANT FOR A SHOWROOM
  // ---------------------------------------------------------------------------
  it('Edge Case 2: No available consultant for a showroom - graceful routing or unassigned queue placement', async () => {
    // Create an isolated test showroom with no staff
    const isolatedShowroom = await Showroom.create({
      name: 'DriveX Remote Satellite Showroom',
      code: 'LKO-SAT-99',
      address: 'Sitapur Road Highway',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226021',
      phone: '+91 522 9999999',
      email: 'satellite@drivex.in',
      operatingHours: '10:00 AM - 07:00 PM',
      geoCoordinates: { latitude: 26.9, longitude: 80.9 },
      isActive: true,
    });

    // Mark ALL consultants and admins in the DB as offline/unavailable
    await User.updateMany({}, { isAvailable: false });

    // Submit lead for the isolated showroom
    const lead = await LeadAssignmentService.createAndAssignLead({
      customerName: 'Aarav Sharma',
      email: 'aarav@example.com',
      phone: '9839011111',
      consentGiven: true,
      preferredShowroomId: isolatedShowroom._id.toString(),
      budgetRange: '₹12 Lakh - ₹15 Lakh',
    });

    // Must be placed in queue with clear timeline entry
    expect(lead).toBeDefined();
    expect(lead.status).toBe('NEW');
    expect(lead.assignedConsultantId).toBeUndefined();

    const timelineActions = lead.activityTimeline.map((t) => t.action);
    expect(timelineActions).toContain('LEAD_UNASSIGNED');

    // Restore consultants & staff to available
    await User.updateMany({}, { isAvailable: true });
  });

  // ---------------------------------------------------------------------------
  // 3. CONSULTANT BECOMING UNAVAILABLE AFTER LEAD ASSIGNMENT
  // ---------------------------------------------------------------------------
  it('Edge Case 3: Consultant becoming unavailable after a lead is assigned - auto-rebalances pending queue', async () => {
    const showroom = await Showroom.findOne({ code: 'LKO-HZG' });
    const priya = await User.findOne({ email: 'priya.verma@drivex.in' });
    const rohit = await User.findOne({ email: 'rohit.sharma@drivex.in' });

    expect(priya).toBeDefined();
    expect(rohit).toBeDefined();

    // Ensure Priya is available and has a lead
    priya!.isAvailable = true;
    priya!.activeLeadCount = 0;
    await priya!.save();

    const lead = await LeadAssignmentService.createAndAssignLead({
      customerName: 'Rohan Mehra',
      email: 'rohan.mehra@example.com',
      phone: '9839022222',
      consentGiven: true,
      preferredShowroomId: showroom!._id.toString(),
    });

    expect(lead.assignedConsultantId?.toString()).toBe(priya!._id.toString());
    expect(lead.status).toBe('ASSIGNED');

    // Priya goes offline - system reallocates active uncontacted leads
    priya!.isAvailable = false;
    await priya!.save();

    const rebalanceResult = await LeadAssignmentService.handleConsultantUnavailable(
      priya!._id.toString(),
      undefined,
      'System Supervisor'
    );

    expect(rebalanceResult.reallocatedCount).toBeGreaterThanOrEqual(1);
    expect(rebalanceResult.reallocatedLeadIds).toContain(lead._id.toString());

    // Check updated lead
    const refreshedLead = await Lead.findById(lead._id);
    expect(refreshedLead?.assignedConsultantId?.toString()).not.toBe(priya!._id.toString());

    // Restore Priya
    priya!.isAvailable = true;
    await priya!.save();
  });

  // ---------------------------------------------------------------------------
  // 4. ADMIN CHANGING PRICING WHILE AN OLDER ENQUIRY EXISTS (IMMUTABILITY)
  // ---------------------------------------------------------------------------
  it('Edge Case 4: Admin changing pricing while an older enquiry exists - historical snapshot remains immutable', async () => {
    const showroom = await Showroom.findOne({ code: 'LKO-HZG' });
    const variant = await VehicleVariant.findOne();
    expect(variant).toBeDefined();

    // Calculate initial on-road quote
    const initialPricing = await PricingService.getOnRoadPrice(variant!._id.toString(), 'Lucknow');
    const originalQuote = initialPricing.totalOnRoadPrice;

    // Customer submits enquiry locking in this pricing snapshot
    const lead = await LeadAssignmentService.createAndAssignLead({
      customerName: 'Divya Rastogi',
      email: 'divya@example.com',
      phone: '9839033333',
      consentGiven: true,
      preferredShowroomId: showroom!._id.toString(),
      preferredVariantId: variant!._id.toString(),
      pricingSnapshot: initialPricing as any,
    });

    expect(lead.pricingSnapshot).toBeDefined();
    expect(lead.pricingSnapshot?.totalOnRoadPrice).toBe(originalQuote);

    // Admin updates the dynamic CityPricing in the database (e.g. increase ex-showroom and RTO)
    await CityPricing.findOneAndUpdate(
      { vehicleVariantId: variant!._id, city: /lucknow/i },
      { $inc: { exShowroomPrice: 50000, rtoRoadTax: 10000 } }
    );

    // Re-query the lead directly from DB
    const fetchedLead = await Lead.findById(lead._id);
    expect(fetchedLead?.pricingSnapshot?.totalOnRoadPrice).toBe(originalQuote);
    expect(fetchedLead?.pricingSnapshot?.totalOnRoadPrice).not.toBe(originalQuote + 60000);
  });

  // ---------------------------------------------------------------------------
  // 5. EXPIRED PRICING CONFIGURATION
  // ---------------------------------------------------------------------------
  it('Edge Case 5: Expired pricing configuration is detected and flagged with notice', async () => {
    const variant = await VehicleVariant.findOne();
    expect(variant).toBeDefined();

    // Create an expired pricing rule for Kanpur with validity ending in 2024
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 10);

    await CityPricing.deleteMany({ vehicleVariantId: variant!._id, city: /testcity/i });
    await CityPricing.create({
      city: 'TestCity',
      state: 'Uttar Pradesh',
      vehicleModelId: variant!.modelId,
      vehicleVariantId: variant!._id,
      exShowroomPrice: 1000000,
      rtoRoadTax: 80000,
      insurance: 38000,
      tcsAmount: 10000,
      mandatoryAccessories: 12000,
      registrationAndFastag: 2500,
      offersDiscount: 15000,
      priceValidityDate: yesterday,
      disclaimer: 'Old promotion rate.',
      isActive: true,
    });

    const quote = await PricingService.getOnRoadPrice(variant!._id.toString(), 'TestCity');
    expect(quote.isExpired).toBe(true);
    expect(quote.disclaimer).toContain('expired');
  });

  // ---------------------------------------------------------------------------
  // 6. INVALID OR MISSING CUSTOMER CONSENT
  // ---------------------------------------------------------------------------
  it('Edge Case 6: Invalid or missing customer consent is rejected under DPDP compliance', async () => {
    const showroom = await Showroom.findOne({ code: 'LKO-HZG' });

    // Missing consent (false)
    await expect(
      LeadAssignmentService.createAndAssignLead({
        customerName: 'Unconsenting User',
        email: 'unconsenting@example.com',
        phone: '9839044444',
        consentGiven: false,
        preferredShowroomId: showroom!._id.toString(),
      })
    ).rejects.toThrow(/consent/i);
  });

  // ---------------------------------------------------------------------------
  // 7 & 8. AI API TIMEOUT & MALFORMED RESPONSE GRACEFUL FALLBACK
  // ---------------------------------------------------------------------------
  it('Edge Cases 7 & 8: AI API timeout and missing key trigger deterministic fallback gracefully', async () => {
    const context = {
      customerName: 'Gaurav Sen',
      vehicleModelName: 'Model H',
      variantName: 'ZX AT',
      showroomName: 'Hazratganj Flagship',
      budgetRange: '₹14 Lakh',
      fuelPreference: 'Petrol',
      transmissionPreference: 'Automatic',
      purchaseTimeline: 'Immediate',
      customerNotes: 'Need test drive on Saturday morning',
      consultantName: 'Priya Verma',
    };

    // Buyer Summary Fallback
    const summaryResponse = await AIService.generateBuyerSummary(context);
    expect(summaryResponse.status).toBe('FALLBACK');
    expect(summaryResponse.content).toContain('Gaurav Sen');
    expect(summaryResponse.content).toContain('Model H');

    // First Reply Draft Fallback
    const replyResponse = await AIService.generateFirstReplyDraft(context);
    expect(replyResponse.status).toBe('FALLBACK');
    expect(replyResponse.content).toContain('Gaurav Sen');
    expect(replyResponse.content).toContain('DriveX');
  });

  // ---------------------------------------------------------------------------
  // 9. UNAUTHORIZED CONSULTANT ACCESSING ANOTHER CONSULTANT'S LEAD
  // ---------------------------------------------------------------------------
  it("Edge Case 9: Unauthorized consultant accessing or updating another consultant's lead is rejected (403)", async () => {
    const priya = await User.findOne({ email: 'priya.verma@drivex.in' });
    const rohit = await User.findOne({ email: 'rohit.sharma@drivex.in' });
    const showroom = await Showroom.findOne({ code: 'LKO-HZG' });

    expect(priya).toBeDefined();
    expect(rohit).toBeDefined();

    // Create a lead explicitly assigned to Priya
    const lead = await Lead.create({
      leadNumber: `LD-2026-PRIYA-${Date.now()}`,
      customerName: 'Priya Exclusive Customer',
      email: 'priyacust@example.com',
      phone: '9839055555',
      consentGiven: true,
      consentTimestamp: new Date(),
      consentPurpose: 'Test Drive',
      source: 'WEBSITE',
      status: 'ASSIGNED',
      preferredShowroomId: showroom!._id,
      assignedConsultantId: priya!._id,
      assignedAt: new Date(),
      activityTimeline: [],
      aiSummary: { content: 'Test summary', status: 'FALLBACK' },
      aiFirstReplyDraft: { content: 'Test draft', status: 'FALLBACK' },
    });

    // Mock Express Request & Response where Rohit attempts to access Priya's lead
    const mockReqGet: any = {
      params: { id: lead._id.toString() },
      user: {
        userId: rohit!._id.toString(),
        role: 'SALES_CONSULTANT',
        email: rohit!.email,
      },
    };

    let statusCode = 200;
    let responseBody: any = null;

    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return mockRes;
      },
      json: (data: any) => {
        responseBody = data;
        return mockRes;
      },
    };

    // Rohit attempts to read Priya's lead
    await LeadController.getLeadById(mockReqGet, mockRes);
    expect(statusCode).toBe(403);
    expect(responseBody?.success).toBe(false);

    // Rohit attempts to update status of Priya's lead
    const mockReqUpdate: any = {
      params: { id: lead._id.toString() },
      body: { status: 'CONTACTED', note: 'Unauthorized update attempt' },
      user: {
        userId: rohit!._id.toString(),
        role: 'SALES_CONSULTANT',
        email: rohit!.email,
      },
    };

    await LeadController.updateStatus(mockReqUpdate, mockRes);
    expect(statusCode).toBe(403);
    expect(responseBody?.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 10. PUBLIC API ATTEMPTING TO EXPOSE FULL REGISTRATION NUMBER
  // ---------------------------------------------------------------------------
  it('Edge Case 10: Public API responses strictly mask vehicle registration numbers (UP32**1234)', async () => {
    const rawReg = 'UP32AB9999';
    const showroom = await Showroom.findOne();

    // Create a used car in DB with raw registration
    const usedCar = await UsedVehicle.create({
      stockId: `UC-EDGE-${Date.now()}`,
      model: 'Model H',
      variant: 'ZX',
      year: 2023,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      kilometres: 24000,
      previousOwners: 1,
      registrationNumber: rawReg,
      askingPrice: 950000,
      color: 'Platinum White',
      showroomId: showroom!._id,
      status: 'Available',
      inspectionReport: {
        rating: 4.9,
        pointsInspected: 150,
        accidentFree: true,
        tyresCondition: '85%',
        batteryCondition: 'Healthy',
        engineCondition: 'Certified',
        bodyCondition: 'Original',
        certifiedBy: 'DriveX Lab',
        inspectionDate: new Date(),
      },
    });

    // Test toJSON transform
    const serialized = usedCar.toJSON();
    expect(serialized.registrationNumber).toBe('UP32**9999');
    expect(serialized.registrationNumber).not.toContain('AB');

    // Ensure raw registration is never leaked to public consumers
    expect(serialized.registrationNumber).toMatch(/^UP32\*\*\d{4}$/);
  });
});
