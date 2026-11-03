export type UserRole = 'BUYER' | 'SALES_CONSULTANT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  showroomId?: string | any;
  activeLeadCount?: number;
  isAvailable?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Showroom {
  _id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  operatingHours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  isActive: boolean;
}

export interface VehicleColor {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface VehicleVariant {
  _id: string;
  modelId: string | any;
  name: string;
  variantCode: string;
  stockId: string;
  slug: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  transmission: 'Manual' | 'Automatic' | 'CVT' | 'DCT';
  exShowroomPrice: number;
  engineCapacityCc: number;
  powerBhp: number;
  torqueNm: number;
  mileageKmpl: number;
  seatingCapacity: number;
  safetyRating?: string;
  colors: VehicleColor[];
  features: string[];
  images: string[];
  isAvailable: boolean;
  stockCount: number;
}

export interface VehicleModel {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  category: 'SUV' | 'Sedan' | 'Hatchback' | 'Electric';
  tagline: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  startingPrice: number;
  launchYear: number;
  isFeatured: boolean;
  isActive: boolean;
  specSummary: {
    engine: string;
    power: string;
    transmission: string;
    mileage: string;
    bootSpace: string;
    groundClearance: string;
  };
  availableFuels?: string[];
  availableTransmissions?: string[];
  variantCount?: number;
}

export interface PriceBreakup {
  exShowroomPrice: number;
  rtoRoadTax: number;
  insurance: number;
  tcsAmount: number;
  mandatoryAccessories: number;
  registrationAndFastag: number;
  offersDiscount: number;
}

export interface CityPricingResult {
  city: string;
  state: string;
  variantId: string;
  variantName?: string;
  modelName?: string;
  breakup: PriceBreakup;
  totalOnRoadPrice: number;
  priceValidityDate: string;
  disclaimer: string;
  isDemonstrationPrice: boolean;
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

export interface UsedVehicleInspection {
  rating: number;
  pointsInspected: number;
  accidentFree: boolean;
  tyresCondition: string;
  batteryCondition: string;
  engineCondition: string;
  bodyCondition: string;
  certifiedBy: string;
  inspectionDate: string;
}

export interface UsedVehicle {
  _id: string;
  stockId: string;
  model: string;
  variant: string;
  year: number;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  transmission: 'Manual' | 'Automatic';
  kilometres: number;
  previousOwners: number;
  registrationNumber: string; // Always masked: UP32**1234
  askingPrice: number;
  color: string;
  images: string[];
  showroomId: Showroom | string;
  status: 'Available' | 'Booked' | 'Sold';
  inspectionReport: UsedVehicleInspection;
  isFeatured: boolean;
  suggestedPriceBand?: {
    min: number;
    max: number;
    median: number;
    sampleSize: number;
  };
}

export type LeadSource = 'WEBSITE' | 'PORTAL_CSV' | 'SOCIAL' | 'WALK_IN';
export type LeadStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'TEST_DRIVE_SCHEDULED'
  | 'CONVERTED'
  | 'LOST';

export interface LeadActivity {
  action: string;
  performedByName?: string;
  note?: string;
  timestamp: string;
}

export interface Lead {
  _id: string;
  leadNumber: string;
  customerName: string;
  email: string;
  phone: string;
  consentGiven: boolean;
  consentTimestamp: string;
  consentPurpose: string;
  source: LeadSource;
  status: LeadStatus;
  preferredModelId?: VehicleModel | any;
  preferredVariantId?: VehicleVariant | any;
  preferredShowroomId: Showroom | any;
  assignedConsultantId?: User | any;
  assignedAt?: string;
  budgetRange?: string;
  fuelPreference?: string;
  transmissionPreference?: string;
  purchaseTimeline?: string;
  customerNotes?: string;
  pricingSnapshot?: Record<string, any>;
  aiSummary: {
    content: string;
    status: 'GENERATED' | 'FALLBACK' | 'FAILED';
    generatedAt?: string;
    modelUsed?: string;
  };
  aiFirstReplyDraft: {
    content: string;
    status: 'GENERATED' | 'FALLBACK' | 'FAILED';
    generatedAt?: string;
    lastEditedContent?: string;
    isCustomized?: boolean;
  };
  responseDueAt?: string;
  firstContactedAt?: string;
  responseTimeSeconds?: number;
  activityTimeline: LeadActivity[];
  createdAt: string;
  updatedAt: string;
}

export type TestDriveStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface TestDriveBooking {
  _id: string;
  bookingReference: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleModelId: VehicleModel | any;
  vehicleVariantId?: VehicleVariant | any;
  showroomId: Showroom | any;
  bookingDate: string;
  timeSlot: string;
  status: TestDriveStatus;
  consultantId?: User | any;
  notes?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface LeadAnalytics {
  totalLeads: number;
  newLeads: number;
  assignedLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  pendingResponses: number;
  conversionRate: string;
  avgResponseTimeSeconds: number;
  avgResponseTimeFormatted: string;
}
