import { CityPricing, ICityPricing } from '../models/CityPricing.js';
import { VehicleVariant } from '../models/VehicleVariant.js';

export interface PriceBreakupResult {
  city: string;
  state: string;
  variantId: string;
  variantName?: string;
  modelName?: string;
  breakup: {
    exShowroomPrice: number;
    rtoRoadTax: number;
    insurance: number;
    tcsAmount: number;
    mandatoryAccessories: number;
    registrationAndFastag: number;
    offersDiscount: number;
  };
  totalOnRoadPrice: number;
  priceValidityDate: string;
  disclaimer: string;
  isDemonstrationPrice: boolean;
}

export interface EMICalculationInput {
  onRoadPrice: number;
  downPayment: number;
  annualInterestRate: number; // e.g. 8.75 for 8.75%
  tenureMonths: number; // e.g. 60
}

export interface EMICalculationResult {
  monthlyEMI: number;
  principal: number;
  totalInterest: number;
  totalRepayment: number;
  downPayment: number;
  tenureMonths: number;
  annualInterestRate: number;
}

export class PricingService {
  /**
   * Calculates the authoritative on-road price breakup for a given variant and city.
   * Pulls dynamic rule-based pricing managed by admins in the database.
   */
  public static async getOnRoadPrice(
    variantId: string,
    city: string = 'Lucknow'
  ): Promise<PriceBreakupResult> {
    const normalizedCity = city.trim();

    // Check admin-managed city pricing record
    let pricingRecord = await CityPricing.findOne({
      vehicleVariantId: variantId,
      city: new RegExp(`^${normalizedCity}$`, 'i'),
      isActive: true,
    }).populate('vehicleVariantId vehicleModelId');

    // If city pricing not configured specifically for this city, fallback to Lucknow default
    if (!pricingRecord && normalizedCity.toLowerCase() !== 'lucknow') {
      pricingRecord = await CityPricing.findOne({
        vehicleVariantId: variantId,
        city: /lucknow/i,
        isActive: true,
      }).populate('vehicleVariantId vehicleModelId');
    }

    // If still no record, construct fallback calculation based on variant ex-showroom price
    if (!pricingRecord) {
      const variant = await VehicleVariant.findById(variantId).populate('modelId');
      if (!variant) {
        throw new Error(`Vehicle variant with ID ${variantId} not found`);
      }

      const exShowroom = variant.exShowroomPrice;
      const rto = Math.round(exShowroom * 0.10); // 10% standard Lucknow RTO demo
      const insurance = Math.round(exShowroom * 0.045); // 4.5% demo comprehensive
      const tcs = exShowroom > 1000000 ? Math.round(exShowroom * 0.01) : 0; // 1% TCS above 10L
      const accessories = 15000;
      const regFastag = 2500;
      const discount = 20000;

      const total = exShowroom + rto + insurance + tcs + accessories + regFastag - discount;
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      return {
        city: normalizedCity || 'Lucknow',
        state: 'Uttar Pradesh',
        variantId: variant._id.toString(),
        variantName: variant.name,
        modelName: (variant.modelId as any)?.name || 'DriveX Model',
        breakup: {
          exShowroomPrice: exShowroom,
          rtoRoadTax: rto,
          insurance,
          tcsAmount: tcs,
          mandatoryAccessories: accessories,
          registrationAndFastag: regFastag,
          offersDiscount: discount,
        },
        totalOnRoadPrice: total,
        priceValidityDate: nextMonth.toISOString().split('T')[0],
        disclaimer:
          'Demonstration on-road estimate for simulation purposes only. Final road tax, insurance, and statutory charges are determined by Lucknow RTO and insurer at the time of final invoicing.',
        isDemonstrationPrice: true,
      };
    }

    const {
      exShowroomPrice,
      rtoRoadTax,
      insurance,
      tcsAmount = 0,
      mandatoryAccessories = 0,
      registrationAndFastag = 0,
      offersDiscount = 0,
      priceValidityDate,
      disclaimer,
    } = pricingRecord;

    const total =
      exShowroomPrice +
      rtoRoadTax +
      insurance +
      tcsAmount +
      mandatoryAccessories +
      registrationAndFastag -
      offersDiscount;

    return {
      city: pricingRecord.city,
      state: pricingRecord.state,
      variantId: pricingRecord.vehicleVariantId._id.toString(),
      variantName: (pricingRecord.vehicleVariantId as any)?.name,
      modelName: (pricingRecord.vehicleModelId as any)?.name,
      breakup: {
        exShowroomPrice,
        rtoRoadTax,
        insurance,
        tcsAmount,
        mandatoryAccessories,
        registrationAndFastag,
        offersDiscount,
      },
      totalOnRoadPrice: total,
      priceValidityDate: new Date(priceValidityDate).toISOString().split('T')[0],
      disclaimer,
      isDemonstrationPrice: true,
    };
  }

  /**
   * Calculates monthly reducing balance EMI and repayment schedule.
   * Formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
   */
  public static calculateEMI(input: EMICalculationInput): EMICalculationResult {
    const { onRoadPrice, downPayment, annualInterestRate, tenureMonths } = input;

    if (onRoadPrice <= 0) {
      throw new Error('On-road price must be greater than zero');
    }
    if (downPayment < 0) {
      throw new Error('Down payment cannot be negative');
    }
    if (downPayment >= onRoadPrice) {
      throw new Error('Down payment cannot be greater than or equal to on-road price');
    }
    if (annualInterestRate < 0 || annualInterestRate > 30) {
      throw new Error('Annual interest rate must be between 0% and 30%');
    }
    if (tenureMonths < 6 || tenureMonths > 96) {
      throw new Error('Loan tenure must be between 6 and 96 months');
    }

    const principal = onRoadPrice - downPayment;
    const monthlyRate = annualInterestRate / (12 * 100);

    let monthlyEMI = 0;
    if (monthlyRate === 0) {
      monthlyEMI = principal / tenureMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, tenureMonths);
      monthlyEMI = (principal * monthlyRate * factor) / (factor - 1);
    }

    const roundedEMI = Math.round(monthlyEMI);
    const totalRepayment = roundedEMI * tenureMonths;
    const totalInterest = totalRepayment - principal;

    return {
      monthlyEMI: roundedEMI,
      principal: Math.round(principal),
      totalInterest: Math.max(0, Math.round(totalInterest)),
      totalRepayment: Math.round(totalRepayment),
      downPayment: Math.round(downPayment),
      tenureMonths,
      annualInterestRate,
    };
  }
}
