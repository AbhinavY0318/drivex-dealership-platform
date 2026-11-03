import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { connectDB, disconnectDB, clearDB } from '../config/db.js';
import { maskRegistrationNumber } from '../utils/masking.js';
import { AIService } from '../services/aiService.js';
import { UsedVehicle } from '../models/UsedVehicle.js';
import { Showroom } from '../models/Showroom.js';

describe('Authentication, RBAC, Privacy Masking & AI Fallback', () => {
  let app: any;
  let testShowroom: any;
  let buyerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    await connectDB();
    await clearDB();
    app = createApp();

    testShowroom = await Showroom.create({
      name: 'Showroom Privacy Test',
      code: 'PRIV-01',
      address: 'Hazratganj, Lucknow',
      city: 'Lucknow',
      pincode: '226001',
      phone: '9839111111',
      email: 'priv@drivex.in',
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Vehicle Registration Privacy Masking (DPDP Compliance)', () => {
    it('should correctly mask vehicle registration format UP32AB1234 to UP32**1234', () => {
      expect(maskRegistrationNumber('UP32AB1234')).toBe('UP32**1234');
      expect(maskRegistrationNumber('DL04CC9999')).toBe('DL04**9999');
      expect(maskRegistrationNumber('UP-32-XY-5555')).toBe('UP32**5555');
    });

    it('should never expose complete registration number in public used vehicles API', async () => {
      await UsedVehicle.create({
        stockId: 'UC-PRIV-01',
        model: 'Model C',
        variant: 'VX',
        year: 2022,
        fuelType: 'Diesel',
        transmission: 'Manual',
        kilometres: 35000,
        registrationNumber: 'UP32AB1234', // Stored in full
        askingPrice: 845000,
        color: 'Grey',
        showroomId: testShowroom._id,
        status: 'Available',
        inspectionReport: {
          rating: 4.8,
          pointsInspected: 150,
          accidentFree: true,
          tyresCondition: 'Good',
          batteryCondition: 'Healthy',
          engineCondition: 'Excellent',
          bodyCondition: 'Clean',
          certifiedBy: 'DriveX Lab',
          inspectionDate: new Date(),
        },
      });

      const res = await request(app).get('/api/used-vehicles');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const items = res.body.data;
      const found = items.find((v: any) => v.stockId === 'UC-PRIV-01');
      expect(found).toBeDefined();

      // Must be masked!
      expect(found.registrationNumber).toBe('UP32**1234');
      expect(found.registrationNumber).not.toBe('UP32AB1234');
    });
  });

  describe('Authentication & Role-Based Access Control', () => {
    it('should register a new buyer account and return JWT tokens', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Rahul Buyer',
        email: 'rahul.buyer@example.com',
        password: 'Password@123',
        phone: '9876543210',
        role: 'BUYER',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      buyerToken = res.body.data.tokens.accessToken;
    });

    it('should register an admin account', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Dealership Admin',
        email: 'admin.test@drivex.in',
        password: 'AdminPassword@123',
        phone: '9876543211',
        role: 'ADMIN',
      });

      expect(res.status).toBe(201);
      adminToken = res.body.data.tokens.accessToken;
    });

    it('should block BUYER from accessing protected ADMIN endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should allow ADMIN to access protected ADMIN endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('AI Service Resilience & Deterministic Fallback', () => {
    it('should generate fallback summary and fallback reply draft marked as FALLBACK when Gemini key is unconfigured', async () => {
      const summary = await AIService.generateBuyerSummary({
        customerName: 'Aarav Mehta',
        vehicleModelName: 'Model H',
        variantName: 'ZX automatic',
        showroomName: 'Hazratganj Flagship',
        budgetRange: '₹12-15 Lakh',
        customerNotes: 'Require quick delivery for festive season',
      });

      expect(summary.status).toBe('FALLBACK');
      expect(summary.provider).toBe('deterministic-fallback');
      expect(summary.content).toContain('Aarav Mehta');
      expect(summary.content).toContain('Model H');

      const draft = await AIService.generateFirstReplyDraft({
        customerName: 'Aarav Mehta',
        vehicleModelName: 'Model H',
        showroomName: 'Hazratganj Flagship',
        consultantName: 'Rohit Sharma',
      });

      expect(draft.status).toBe('FALLBACK');
      expect(draft.content).toContain('Dear Aarav Mehta');
      expect(draft.content).toContain('Hazratganj Flagship');
      expect(draft.content).toContain('Rohit Sharma');
    });
  });
});
