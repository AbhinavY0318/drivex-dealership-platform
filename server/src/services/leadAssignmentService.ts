import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { Lead, ILead, LeadStatus, ILeadActivity } from '../models/Lead.js';
import { LeadAssignmentHistory } from '../models/LeadAssignmentHistory.js';
import { Notification } from '../models/Notification.js';
import { Showroom } from '../models/Showroom.js';
import { VehicleModel } from '../models/VehicleModel.js';
import { VehicleVariant } from '../models/VehicleVariant.js';
import { AIService } from './aiService.js';
import { config } from '../config/environment.js';

export interface CreateLeadInput {
  customerName: string;
  email: string;
  phone: string;
  consentGiven: boolean;
  consentPurpose?: string;
  optOutCommunications?: boolean;
  source?: 'WEBSITE' | 'PORTAL_CSV' | 'SOCIAL' | 'WALK_IN';
  preferredModelId?: string;
  preferredVariantId?: string;
  preferredShowroomId: string;
  budgetRange?: string;
  fuelPreference?: string;
  transmissionPreference?: string;
  purchaseTimeline?: string;
  customerNotes?: string;
  pricingSnapshot?: Record<string, any>;
}

export class LeadAssignmentService {
  /**
   * Deterministic Lead Assignment Algorithm:
   * 1. Filters consultants at the given showroom with role=SALES_CONSULTANT and isAvailable=true.
   * 2. Sorts primarily by activeLeadCount ascending (lowest workload).
   * 3. Breaks ties deterministically via lastAssignedAt ascending (oldest assignment first, classic round-robin).
   * 4. If showroom has no consultants, falls back to any available active consultant across Lucknow.
   */
  public static async selectEligibleConsultant(
    showroomId: string
  ): Promise<{ consultant: IUser | null; strategy: string; reason: string }> {
    // Primary pool: Available consultants assigned to this specific showroom
    let candidates = await User.find({
      role: 'SALES_CONSULTANT',
      showroomId: new mongoose.Types.ObjectId(showroomId),
      isAvailable: true,
    }).sort({ activeLeadCount: 1, lastAssignedAt: 1, _id: 1 });

    if (candidates.length > 0) {
      return {
        consultant: candidates[0],
        strategy: 'SHOWROOM_ROUND_ROBIN_LOWEST_WORKLOAD',
        reason: `Assigned to ${candidates[0].name} (lowest workload of ${candidates[0].activeLeadCount} active leads at selected showroom).`,
      };
    }

    // Secondary fallback: Available consultants across any showroom in Lucknow
    const fallbackCandidates = await User.find({
      role: 'SALES_CONSULTANT',
      isAvailable: true,
    }).sort({ activeLeadCount: 1, lastAssignedAt: 1, _id: 1 });

    if (fallbackCandidates.length > 0) {
      return {
        consultant: fallbackCandidates[0],
        strategy: 'CROSS_SHOWROOM_FALLBACK_LOWEST_WORKLOAD',
        reason: `No consultant currently active at preferred showroom; assigned to Lucknow central consultant ${fallbackCandidates[0].name}.`,
      };
    }

    // Tertiary: If all showroom consultants are offline, find an available administrative supervisor
    const availableAdmin = await User.findOne({
      role: 'ADMIN',
      isAvailable: true,
    }).sort({ activeLeadCount: 1 });

    if (availableAdmin) {
      return {
        consultant: availableAdmin,
        strategy: 'EMERGENCY_OVERFLOW_ASSIGNMENT',
        reason: 'All showroom consultants occupied or offline; routed to emergency overflow administrative pool.',
      };
    }

    return {
      consultant: null,
      strategy: 'UNASSIGNED_QUEUE',
      reason: 'No sales consultants or administrators currently available in dealership pool.',
    };
  }

  /**
   * Creates a lead, executes auto-assignment, schedules 5-minute SLA timer,
   * generates mock acknowledgement, and triggers AI summary/first-reply draft.
   */
  public static async createAndAssignLead(input: CreateLeadInput): Promise<ILead> {
    if (!input.consentGiven) {
      throw new Error('DPDP Compliance Error: Explicit consent is mandatory to process customer enquiries.');
    }

    const showroom = await Showroom.findById(input.preferredShowroomId);
    if (!showroom) {
      throw new Error(`Invalid showroom ID: ${input.preferredShowroomId}`);
    }

    let vehicleModel: any = null;
    if (input.preferredModelId) {
      vehicleModel = await VehicleModel.findById(input.preferredModelId);
    }

    let variant: any = null;
    if (input.preferredVariantId) {
      variant = await VehicleVariant.findById(input.preferredVariantId);
    }

    // Generate unique Lead Number: LD-YYYY-RANDOMHEX
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const leadNumber = `LD-2026-${randomHex}`;

    // Select consultant deterministically
    const { consultant, strategy, reason } = await this.selectEligibleConsultant(
      input.preferredShowroomId
    );

    const now = new Date();
    const responseDueAt = new Date(now.getTime() + config.slaResponseTimeMinutes * 60 * 1000);

    // Initial timeline
    const activityTimeline: ILeadActivity[] = [
      {
        action: 'LEAD_CREATED',
        note: `Customer submitted enquiry via ${input.source || 'WEBSITE'}.`,
        timestamp: now,
      },
    ];

    if (consultant) {
      activityTimeline.push({
        action: 'LEAD_ASSIGNED',
        performedByName: 'DriveX Auto-Assignment Engine',
        note: reason,
        timestamp: now,
      });
    } else {
      activityTimeline.push({
        action: 'LEAD_UNASSIGNED',
        performedByName: 'DriveX Auto-Assignment Engine',
        note: 'No available consultant found at preferred showroom or central pool. Lead placed in unassigned queue for administrative routing.',
        timestamp: now,
      });
    }

    // Create the lead document
    const lead = new Lead({
      leadNumber,
      customerName: input.customerName,
      email: input.email,
      phone: input.phone,
      consentGiven: input.consentGiven,
      consentTimestamp: now,
      consentPurpose:
        input.consentPurpose ||
        'Authorized communication regarding vehicle purchase, test drive scheduling, and dealer pricing.',
      optOutCommunications: !!input.optOutCommunications,
      source: input.source || 'WEBSITE',
      status: consultant ? 'ASSIGNED' : 'NEW',
      preferredModelId: input.preferredModelId,
      preferredVariantId: input.preferredVariantId,
      preferredShowroomId: input.preferredShowroomId,
      assignedConsultantId: consultant ? consultant._id : undefined,
      assignedAt: consultant ? now : undefined,
      responseDueAt: consultant ? responseDueAt : undefined,
      budgetRange: input.budgetRange,
      fuelPreference: input.fuelPreference,
      transmissionPreference: input.transmissionPreference,
      purchaseTimeline: input.purchaseTimeline,
      customerNotes: input.customerNotes,
      pricingSnapshot: input.pricingSnapshot,
      activityTimeline,
    });

    await lead.save();

    // If consultant was assigned, update consultant stats & write audit history
    if (consultant) {
      const priorCount = consultant.activeLeadCount || 0;
      consultant.activeLeadCount = priorCount + 1;
      consultant.lastAssignedAt = now;
      await consultant.save();

      await LeadAssignmentHistory.create({
        leadId: lead._id,
        newConsultantId: consultant._id,
        assignedByName: 'DriveX Auto-Assignment Engine',
        assignmentStrategy: strategy,
        reason,
        consultantWorkloadAtAssignment: priorCount,
        timestamp: now,
      });

      // Create notification for consultant
      await Notification.create({
        userId: consultant._id,
        title: `New High-Priority Lead: ${input.customerName}`,
        message: `New enquiry for ${vehicleModel?.name || 'DriveX Vehicle'} at ${showroom.name}. 5-minute response SLA active!`,
        type: 'LEAD_ASSIGNED',
        metadata: { leadId: lead._id, responseDueAt },
      });
    }

    // Trigger AI summary & first-reply draft generation (resilient with fallback)
    const aiContext = {
      customerName: input.customerName,
      vehicleModelName: vehicleModel?.name,
      variantName: variant?.name,
      showroomName: showroom.name,
      budgetRange: input.budgetRange,
      fuelPreference: input.fuelPreference,
      transmissionPreference: input.transmissionPreference,
      purchaseTimeline: input.purchaseTimeline,
      customerNotes: input.customerNotes,
      consultantName: consultant?.name,
    };

    try {
      const [aiSummaryRes, aiFirstReplyRes] = await Promise.all([
        AIService.generateBuyerSummary(aiContext),
        AIService.generateFirstReplyDraft(aiContext),
      ]);

      lead.aiSummary = {
        content: aiSummaryRes.content,
        status: aiSummaryRes.status,
        generatedAt: new Date(),
        modelUsed: aiSummaryRes.modelUsed,
      };

      lead.aiFirstReplyDraft = {
        content: aiFirstReplyRes.content,
        status: aiFirstReplyRes.status,
        generatedAt: new Date(),
        lastEditedContent: aiFirstReplyRes.content,
        isCustomized: false,
      };

      await lead.save();
    } catch (aiErr) {
      console.warn('[LeadAssignment] AI generation non-blocking catch:', aiErr);
    }

    return lead;
  }

  /**
   * Reassigns lead to a different consultant with audit trail.
   */
  public static async reassignLead(
    leadId: string,
    newConsultantId: string,
    reason: string,
    performedByUserId?: string,
    performedByName: string = 'Sales Manager'
  ): Promise<ILead> {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const previousConsultantId = lead.assignedConsultantId;
    const newConsultant = await User.findById(newConsultantId);
    if (!newConsultant) {
      throw new Error(`Target consultant ${newConsultantId} not found`);
    }

    // Decrement previous consultant count
    if (previousConsultantId && previousConsultantId.toString() !== newConsultantId) {
      await User.findByIdAndUpdate(previousConsultantId, {
        $inc: { activeLeadCount: -1 },
      });
    }

    // Increment new consultant count
    newConsultant.activeLeadCount = (newConsultant.activeLeadCount || 0) + 1;
    newConsultant.lastAssignedAt = new Date();
    await newConsultant.save();

    const now = new Date();
    lead.assignedConsultantId = newConsultant._id;
    lead.assignedAt = now;
    lead.status = 'ASSIGNED';
    lead.responseDueAt = new Date(now.getTime() + config.slaResponseTimeMinutes * 60 * 1000);

    lead.activityTimeline.push({
      action: 'LEAD_REASSIGNED',
      performedBy: performedByUserId ? new mongoose.Types.ObjectId(performedByUserId) : undefined,
      performedByName,
      note: `Reassigned to ${newConsultant.name}. Reason: ${reason}`,
      timestamp: now,
    });

    await lead.save();

    await LeadAssignmentHistory.create({
      leadId: lead._id,
      previousConsultantId,
      newConsultantId: newConsultant._id,
      assignedBy: performedByUserId ? new mongoose.Types.ObjectId(performedByUserId) : undefined,
      assignedByName: performedByName,
      assignmentStrategy: 'MANUAL_REASSIGNMENT',
      reason,
      consultantWorkloadAtAssignment: newConsultant.activeLeadCount - 1,
      timestamp: now,
    });

    await Notification.create({
      userId: newConsultant._id,
      title: `Lead Reassigned to You: ${lead.customerName}`,
      message: `Lead ${lead.leadNumber} reassigned to your queue. SLA timer refreshed.`,
      type: 'LEAD_ASSIGNED',
      metadata: { leadId: lead._id },
    });

    return lead;
  }

  /**
   * Updates lead status and manages active workload decrement when converted or lost.
   */
  public static async updateStatus(
    leadId: string,
    newStatus: LeadStatus,
    performedByUserId?: string,
    performedByName: string = 'Consultant',
    note?: string
  ): Promise<ILead> {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const oldStatus = lead.status;
    const now = new Date();

    // If first contact is recorded, compute response time
    if (!lead.firstContactedAt && ['CONTACTED', 'QUALIFIED', 'TEST_DRIVE_SCHEDULED', 'CONVERTED'].includes(newStatus)) {
      lead.firstContactedAt = now;
      if (lead.assignedAt) {
        lead.responseTimeSeconds = Math.round((now.getTime() - lead.assignedAt.getTime()) / 1000);
      }
    }

    lead.status = newStatus;
    lead.activityTimeline.push({
      action: `STATUS_CHANGED_${newStatus}`,
      performedBy: performedByUserId ? new mongoose.Types.ObjectId(performedByUserId) : undefined,
      performedByName,
      note: note || `Lead status updated from ${oldStatus} to ${newStatus}.`,
      timestamp: now,
    });

    // If reached terminal state (CONVERTED or LOST), release consultant's active lead count
    if (['CONVERTED', 'LOST'].includes(newStatus) && !['CONVERTED', 'LOST'].includes(oldStatus)) {
      if (lead.assignedConsultantId) {
        await User.findByIdAndUpdate(lead.assignedConsultantId, {
          $inc: { activeLeadCount: -1 },
        });
      }
    }

    await lead.save();
    return lead;
  }

  /**
   * Rebalances active uncontacted leads when a consultant goes offline or unavailable.
   */
  public static async handleConsultantUnavailable(
    consultantId: string,
    performedByUserId?: string,
    performedByName: string = 'Dealership Administrator'
  ): Promise<{ reallocatedCount: number; reallocatedLeadIds: string[] }> {
    const consultant = await User.findById(consultantId);
    if (!consultant) throw new Error(`Consultant ${consultantId} not found`);

    // Find all active uncontacted leads assigned to this consultant
    const activeLeads = await Lead.find({
      assignedConsultantId: consultant._id,
      status: { $in: ['NEW', 'ASSIGNED'] },
    });

    const reallocatedLeadIds: string[] = [];

    for (const lead of activeLeads) {
      // Find new eligible consultant
      const { consultant: nextConsultant } = await this.selectEligibleConsultant(
        lead.preferredShowroomId.toString()
      );

      if (nextConsultant && nextConsultant._id.toString() !== consultant._id.toString()) {
        await this.reassignLead(
          lead._id.toString(),
          nextConsultant._id.toString(),
          `Automated rebalance: original consultant ${consultant.name} went offline.`,
          performedByUserId,
          performedByName
        );
        reallocatedLeadIds.push(lead._id.toString());
      }
    }

    return {
      reallocatedCount: reallocatedLeadIds.length,
      reallocatedLeadIds,
    };
  }
}
