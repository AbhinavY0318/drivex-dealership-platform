import mongoose, { Document, Schema } from 'mongoose';

export interface ILeadAssignmentHistory extends Document {
  leadId: mongoose.Types.ObjectId;
  previousConsultantId?: mongoose.Types.ObjectId;
  newConsultantId: mongoose.Types.ObjectId;
  assignedBy?: mongoose.Types.ObjectId;
  assignedByName: string;
  assignmentStrategy: string;
  reason: string;
  consultantWorkloadAtAssignment: number;
  timestamp: Date;
}

const LeadAssignmentHistorySchema = new Schema<ILeadAssignmentHistory>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    previousConsultantId: { type: Schema.Types.ObjectId, ref: 'User' },
    newConsultantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedByName: { type: String, default: 'DriveX Auto-Assignment Engine' },
    assignmentStrategy: { type: String, required: true },
    reason: { type: String, required: true },
    consultantWorkloadAtAssignment: { type: Number, required: true, default: 0 },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const LeadAssignmentHistory = mongoose.model<ILeadAssignmentHistory>(
  'LeadAssignmentHistory',
  LeadAssignmentHistorySchema
);
