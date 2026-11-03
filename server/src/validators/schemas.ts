import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  role: z.enum(['BUYER', 'SALES_CONSULTANT', 'ADMIN']).optional(),
  showroomId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const createLeadSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  email: z.string().email('Valid email address required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'DPDP consent must be explicitly granted before enquiry submission',
  }),
  consentPurpose: z.string().optional(),
  optOutCommunications: z.boolean().optional(),
  source: z.enum(['WEBSITE', 'PORTAL_CSV', 'SOCIAL', 'WALK_IN']).optional(),
  preferredModelId: z.string().optional(),
  preferredVariantId: z.string().optional(),
  preferredShowroomId: z.string().min(1, 'Preferred showroom is required'),
  budgetRange: z.string().optional(),
  fuelPreference: z.string().optional(),
  transmissionPreference: z.string().optional(),
  purchaseTimeline: z.string().optional(),
  customerNotes: z.string().optional(),
  pricingSnapshot: z.record(z.any()).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum([
    'NEW',
    'ASSIGNED',
    'CONTACTED',
    'QUALIFIED',
    'TEST_DRIVE_SCHEDULED',
    'CONVERTED',
    'LOST',
  ]),
  note: z.string().optional(),
});

export const reassignLeadSchema = z.object({
  newConsultantId: z.string().min(1, 'Target consultant ID is required'),
  reason: z.string().min(3, 'Reassignment reason is required'),
});

export const bookTestDriveSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Valid 10-digit phone number is required'),
  customerEmail: z.string().email('Valid email address required'),
  vehicleModelId: z.string().min(1, 'Vehicle model is required'),
  vehicleVariantId: z.string().optional(),
  showroomId: z.string().min(1, 'Preferred showroom is required'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  notes: z.string().optional(),
});

export const emiCalculationSchema = z.object({
  onRoadPrice: z.number().positive('On-road price must be positive'),
  downPayment: z.number().nonnegative('Down payment cannot be negative'),
  annualInterestRate: z.number().min(1).max(30, 'Interest rate must be between 1% and 30%'),
  tenureMonths: z.number().int().min(6).max(96, 'Tenure must be between 6 and 96 months'),
});

export const updateDraftSchema = z.object({
  editedContent: z.string().min(10, 'Message draft cannot be empty'),
});
