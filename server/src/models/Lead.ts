import mongoose, { Document, Schema } from 'mongoose';

export type LeadSource = 'WEBSITE' | 'PORTAL_CSV' | 'SOCIAL' | 'WALK_IN';
export type LeadStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'TEST_DRIVE_SCHEDULED'
  | 'CONVERTED'
  | 'LOST';

export interface ILeadActivity {
  action: string;
  performedBy?: mongoose.Types.ObjectId;
  performedByName?: string;
  note?: string;
  timestamp: Date;
}

export interface ILeadAISummary {
  content: string;
  status: 'GENERATED' | 'FALLBACK' | 'FAILED';
  generatedAt?: Date;
  modelUsed?: string;
}

export interface ILeadAIFirstReply {
  content: string;
  status: 'GENERATED' | 'FALLBACK' | 'FAILED';
  generatedAt?: Date;
  lastEditedContent?: string;
  isCustomized?: boolean;
}

export interface ILead extends Document {
  leadNumber: string;
  customerName: string;
  email: string;
  phone: string;
  consentGiven: boolean;
  consentTimestamp: Date;
  consentPurpose: string;
  optOutCommunications: boolean;
  source: LeadSource;
  status: LeadStatus;
  preferredModelId?: mongoose.Types.ObjectId;
  preferredVariantId?: mongoose.Types.ObjectId;
  preferredShowroomId: mongoose.Types.ObjectId;
  assignedConsultantId?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  budgetRange?: string;
  fuelPreference?: string;
  transmissionPreference?: string;
  purchaseTimeline?: string;
  customerNotes?: string;
  pricingSnapshot?: Record<string, any>;
  aiSummary: ILeadAISummary;
  aiFirstReplyDraft: ILeadAIFirstReply;
  responseDueAt?: Date;
  firstContactedAt?: Date;
  responseTimeSeconds?: number;
  activityTimeline: ILeadActivity[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<ILeadActivity>(
  {
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    performedByName: { type: String },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LeadSchema = new Schema<ILead>(
  {
    leadNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    consentGiven: { type: Boolean, required: true },
    consentTimestamp: { type: Date, required: true, default: Date.now },
    consentPurpose: {
      type: String,
      default: 'Authorized communication regarding vehicle purchase, test drive scheduling, and dealer pricing.',
    },
    optOutCommunications: { type: Boolean, default: false },
    source: {
      type: String,
      enum: ['WEBSITE', 'PORTAL_CSV', 'SOCIAL', 'WALK_IN'],
      default: 'WEBSITE',
      index: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'ASSIGNED', 'CONTACTED', 'QUALIFIED', 'TEST_DRIVE_SCHEDULED', 'CONVERTED', 'LOST'],
      default: 'NEW',
      index: true,
    },
    preferredModelId: { type: Schema.Types.ObjectId, ref: 'VehicleModel', index: true },
    preferredVariantId: { type: Schema.Types.ObjectId, ref: 'VehicleVariant' },
    preferredShowroomId: { type: Schema.Types.ObjectId, ref: 'Showroom', required: true, index: true },
    assignedConsultantId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedAt: { type: Date, index: true },
    budgetRange: { type: String },
    fuelPreference: { type: String },
    transmissionPreference: { type: String },
    purchaseTimeline: { type: String },
    customerNotes: { type: String },
    pricingSnapshot: { type: Schema.Types.Mixed },
    aiSummary: {
      content: { type: String, default: '' },
      status: { type: String, enum: ['GENERATED', 'FALLBACK', 'FAILED'], default: 'FALLBACK' },
      generatedAt: { type: Date },
      modelUsed: { type: String },
    },
    aiFirstReplyDraft: {
      content: { type: String, default: '' },
      status: { type: String, enum: ['GENERATED', 'FALLBACK', 'FAILED'], default: 'FALLBACK' },
      generatedAt: { type: Date },
      lastEditedContent: { type: String },
      isCustomized: { type: Boolean, default: false },
    },
    responseDueAt: { type: Date, index: true },
    firstContactedAt: { type: Date },
    responseTimeSeconds: { type: Number },
    activityTimeline: [ActivitySchema],
  },
  { timestamps: true }
);

// Indexes for lead inbox querying, filtering, and consultant SLA tracking
LeadSchema.index({ assignedConsultantId: 1, status: 1, createdAt: -1 });
LeadSchema.index({ status: 1, responseDueAt: 1 });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
