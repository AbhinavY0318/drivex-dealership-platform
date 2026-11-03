import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { connectDB, disconnectDB, clearDB } from '../config/db.js';
import { seedDatabase } from '../scripts/seed.js';

describe('Mandatory End-to-End Client Workflow Scenario', () => {
  let app: any;
  let buyerToken: string;
  let consultantToken: string;
  let modelHId: string;
  let variantId: string;
  let showroomId: string;
  let createdLeadId: string;

  beforeAll(async () => {
    await connectDB();
    await clearDB();
    await seedDatabase(true);
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('Step 1: Customer logs in', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'customer@drivex.in',
      password: 'Buyer@2026',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    buyerToken = res.body.data.tokens.accessToken;
  });

  it('Step 2: Customer browses Model H', async () => {
    const res = await request(app).get('/api/vehicles/model-h');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.model.name).toBe('Model H');
    expect(res.body.data.variants.length).toBeGreaterThan(0);

    modelHId = res.body.data.model._id;
    // Find the ZX automatic variant
    const zxVariant = res.body.data.variants.find((v: any) => v.stockId === 'NEW-H-02');
    expect(zxVariant).toBeDefined();
    variantId = zxVariant._id;
  });

  it('Step 3 & 4: Customer selects Lucknow and views on-road price breakup', async () => {
    const res = await request(app).get(`/api/vehicles/variant/${variantId}/pricing?city=Lucknow`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const pricing = res.body.data;
    expect(pricing.city).toBe('Lucknow');
    expect(pricing.breakup.exShowroomPrice).toBe(1245000);
    expect(pricing.breakup.rtoRoadTax).toBeGreaterThan(0);
    expect(pricing.breakup.insurance).toBeGreaterThan(0);
    expect(pricing.totalOnRoadPrice).toBeGreaterThan(pricing.breakup.exShowroomPrice);
    expect(pricing.disclaimer).toBeDefined();
    expect(pricing.priceValidityDate).toBeDefined();
  });

  it('Step 5, 6, 7 & 8: Customer submits enquiry -> Backend creates lead, auto-assigns consultant, generates AI summary', async () => {
    // Fetch Lucknow Hazratganj showroom
    const showroomsRes = await request(app).get('/api/showrooms');
    expect(showroomsRes.status).toBe(200);
    const showroom = showroomsRes.body.data.find((s: any) => s.code === 'LKO-HZG');
    expect(showroom).toBeDefined();
    showroomId = showroom._id;

    const enquiryRes = await request(app).post('/api/leads').send({
      customerName: 'Vikram Malhotra',
      email: 'customer@drivex.in',
      phone: '+91 94150 99881',
      consentGiven: true,
      preferredModelId: modelHId,
      preferredVariantId: variantId,
      preferredShowroomId: showroomId,
      budgetRange: '₹12 Lakh - ₹15 Lakh',
      fuelPreference: 'Petrol',
      transmissionPreference: 'Automatic',
      purchaseTimeline: 'Within 2 weeks',
      customerNotes: 'Need test drive on Saturday and on-road quotation.',
    });

    expect(enquiryRes.status).toBe(201);
    expect(enquiryRes.body.success).toBe(true);
    expect(enquiryRes.body.data.leadNumber).toBeDefined();
    expect(enquiryRes.body.data.status).toBe('ASSIGNED');
    expect(enquiryRes.body.data.responseDueAt).toBeDefined();
  });

  it('Step 9: Consultant logs in', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'priya.verma@drivex.in',
      password: 'Consultant@2026',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('SALES_CONSULTANT');
    consultantToken = res.body.data.tokens.accessToken;
  });

  it('Step 10: Consultant sees the newly assigned lead in their inbox with AI summary & editable first-reply draft', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${consultantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const leads = res.body.data;
    const lead = leads.find((l: any) => l.email === 'customer@drivex.in');
    expect(lead).toBeDefined();
    createdLeadId = lead._id;

    // Check detail view for AI summary and first-reply draft
    const detailRes = await request(app)
      .get(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${consultantToken}`);

    expect(detailRes.status).toBe(200);
    const fullLead = detailRes.body.data;
    expect(fullLead.aiSummary).toBeDefined();
    expect(fullLead.aiSummary.content.length).toBeGreaterThan(10);
    expect(fullLead.aiFirstReplyDraft).toBeDefined();
    expect(fullLead.aiFirstReplyDraft.content.length).toBeGreaterThan(10);
  });

  it('Step 11: Consultant updates lead status to CONTACTED', async () => {
    const res = await request(app)
      .patch(`/api/leads/${createdLeadId}/status`)
      .set('Authorization', `Bearer ${consultantToken}`)
      .send({
        status: 'CONTACTED',
        note: 'Called customer Vikram and shared digital brochure.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CONTACTED');
  });

  it('Step 12: Customer books an available test-drive slot', async () => {
    const date = '2026-11-28';
    // Check availability
    const availRes = await request(app).get(
      `/api/test-drives/availability?showroomId=${showroomId}&vehicleModelId=${modelHId}&date=${date}`
    );
    expect(availRes.status).toBe(200);
    const availableSlot = availRes.body.data.find((s: any) => s.isAvailable);
    expect(availableSlot).toBeDefined();

    // Book the slot
    const bookRes = await request(app)
      .post('/api/test-drives')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        customerName: 'Vikram Malhotra',
        customerPhone: '+91 94150 99881',
        customerEmail: 'customer@drivex.in',
        vehicleModelId: modelHId,
        vehicleVariantId: variantId,
        showroomId: showroomId,
        bookingDate: date,
        timeSlot: availableSlot.timeSlot,
        notes: 'End-to-end verification booking',
      });

    expect(bookRes.status).toBe(201);
    expect(bookRes.body.success).toBe(true);
    expect(bookRes.body.data.bookingReference).toBeDefined();
    expect(bookRes.body.data.status).toBe('CONFIRMED');
  });
});
