import mongoose, { Document, Schema } from 'mongoose';

export type AIPromptType = 'BUYER_SUMMARY' | 'FIRST_REPLY' | 'PRICE_ESTIMATE';
export type AIStatus = 'SUCCESS' | 'FALLBACK' | 'ERROR';

export interface IAIInteraction extends Document {
  leadId?: mongoose.Types.ObjectId;
  promptType: AIPromptType;
  prompt: string;
  response: string;
  status: AIStatus;
  provider: string; // 'gemini-1.5-flash' or 'deterministic-fallback'
  latencyMs: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AIInteractionSchema = new Schema<IAIInteraction>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
    promptType: {
      type: String,
      enum: ['BUYER_SUMMARY', 'FIRST_REPLY', 'PRICE_ESTIMATE'],
      required: true,
      index: true,
    },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUCCESS', 'FALLBACK', 'ERROR'],
      required: true,
      index: true,
    },
    provider: { type: String, default: 'deterministic-fallback' },
    latencyMs: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AIInteraction = mongoose.model<IAIInteraction>('AIInteraction', AIInteractionSchema);
