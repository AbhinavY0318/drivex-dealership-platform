import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PricingService } from '../services/pricingService.js';
import { connectDB, disconnectDB, clearDB } from '../config/db.js';
import { VehicleModel } from '../models/VehicleModel.js';
import { VehicleVariant } from '../models/VehicleVariant.js';
import { CityPricing } from '../models/CityPricing.js';

describe('Pricing Engine & EMI Calculator Tests', () => {
  beforeAll(async () => {
    await connectDB();
    await clearDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('EMI Calculator (Standard Reducing-Balance Formula)', () => {
    it('should correctly calculate standard reducing-balance EMI for ₹10,00,000 loan at 9% for 60 months', () => {
      const result = PricingService.calculateEMI({
        onRoadPrice: 1200000,
        downPayment: 200000, // Loan amount = 10,00,000
        annualInterestRate: 9,
        tenureMonths: 60,
      });

      expect(result.principal).toBe(1000000);
      expect(result.tenureMonths).toBe(60);
      // Theoretical EMI for 10L at 9% 5 years = ~₹20,758
      expect(result.monthlyEMI).toBeGreaterThanOrEqual(20700);
      expect(result.monthlyEMI).toBeLessThanOrEqual(20800);
      expect(result.totalRepayment).toBe(result.monthlyEMI * 60);
      expect(result.totalInterest).toBe(result.totalRepayment - result.principal);
    });

    it('should handle zero interest rate gracefully as simple division', () => {
      const result = PricingService.calculateEMI({
        onRoadPrice: 600000,
        downPayment: 100000, // 5,00,000
        annualInterestRate: 0,
        tenureMonths: 50,
      });

      expect(result.monthlyEMI).toBe(10000);
      expect(result.totalInterest).toBe(0);
      expect(result.totalRepayment).toBe(500000);
    });

    it('should throw an error if down payment is greater than or equal to on-road price', () => {
      expect(() =>
        PricingService.calculateEMI({
          onRoadPrice: 1000000,
          downPayment: 1000000,
          annualInterestRate: 8.5,
          tenureMonths: 60,
        })
      ).toThrow('Down payment cannot be greater than or equal to on-road price');
    });

    it('should throw an error for negative down payment or invalid interest rate', () => {
      expect(() =>
        PricingService.calculateEMI({
          onRoadPrice: 1000000,
          downPayment: -5000,
          annualInterestRate: 8.5,
          tenureMonths: 60,
        })
      ).toThrow('Down payment cannot be negative');

      expect(() =>
        PricingService.calculateEMI({
          onRoadPrice: 1000000,
          downPayment: 200000,
          annualInterestRate: 35, // excess rate
          tenureMonths: 60,
        })
      ).toThrow('Annual interest rate must be between 0% and 30%');
    });
  });

  describe('Dynamic On-Road Price Calculation Engine', () => {
    it('should calculate city-specific on-road price from admin-managed database record', async () => {
      const model = await VehicleModel.create({
        name: 'Model H Test',
        slug: 'model-h-test',
        brand: 'DriveX',
        category: 'SUV',
        tagline: 'Test SUV',
        description: 'Testing',
        heroImage: 'test.jpg',
        startingPrice: 1245000,
      });

      const variant = await VehicleVariant.create({
        modelId: model._id,
        name: 'ZX automatic',
        variantCode: 'H-ZX-TEST',
        stockId: 'TEST-H-01',
        slug: 'test-h-zx',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        exShowroomPrice: 1245000,
        engineCapacityCc: 1498,
        powerBhp: 148,
        torqueNm: 250,
        mileageKmpl: 17.8,
        seatingCapacity: 5,
      });

      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + 30);

      await CityPricing.create({
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        vehicleModelId: model._id,
        vehicleVariantId: variant._id,
        exShowroomPrice: 1245000,
        rtoRoadTax: 124500,
        insurance: 56000,
        tcsAmount: 12450,
        mandatoryAccessories: 15000,
        registrationAndFastag: 2500,
        offersDiscount: 20000,
        priceValidityDate: validityDate,
        disclaimer: 'Official demo test disclaimer',
        isActive: true,
      });

      const pricing = await PricingService.getOnRoadPrice(variant._id.toString(), 'Lucknow');

      expect(pricing.city).toBe('Lucknow');
      expect(pricing.breakup.exShowroomPrice).toBe(1245000);
      expect(pricing.breakup.rtoRoadTax).toBe(124500);
      expect(pricing.breakup.insurance).toBe(56000);
      expect(pricing.breakup.mandatoryAccessories).toBe(15000);
      expect(pricing.breakup.offersDiscount).toBe(20000);

      // Formula: 1245000 + 124500 + 56000 + 12450 + 15000 + 2500 - 20000 = 1435450
      expect(pricing.totalOnRoadPrice).toBe(1435450);
      expect(pricing.disclaimer).toBe('Official demo test disclaimer');
      expect(pricing.isDemonstrationPrice).toBe(true);
    });
  });
});
