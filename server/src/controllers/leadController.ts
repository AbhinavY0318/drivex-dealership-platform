import { Request, Response } from 'express';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';
import { LeadAssignmentService } from '../services/leadAssignmentService.js';
import { AIService } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  createLeadSchema,
  updateLeadStatusSchema,
  reassignLeadSchema,
  updateDraftSchema,
} from '../validators/schemas.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export class LeadController {
  public static async createLead(req: Request, res: Response) {
    try {
      const parsed = createLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const lead = await LeadAssignmentService.createAndAssignLead(parsed.data);

      return sendSuccess(
        res,
        'Enquiry submitted successfully. A dedicated sales consultant has been assigned and will connect within 5 minutes.',
        {
          leadNumber: lead.leadNumber,
          customerName: lead.customerName,
          status: lead.status,
          assignedAt: lead.assignedAt,
          responseDueAt: lead.responseDueAt,
        },
        201
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to submit enquiry', 400, err);
    }
  }

  public static async getAllLeads(req: AuthRequest, res: Response) {
    try {
      const { status, search, priority, page = '1', limit = '20' } = req.query;
      const user = req.user!;

      const query: any = {};

      // If user is a sales consultant, only show leads assigned to them or unassigned
      if (user.role === 'SALES_CONSULTANT') {
        query.$or = [{ assignedConsultantId: user.userId }, { status: 'NEW' }];
      }

      if (status && status !== 'ALL') {
        query.status = status;
      }

      if (search && typeof search === 'string') {
        query.$or = [
          { leadNumber: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 20;
      const skip = (pageNum - 1) * limitNum;

      const [total, leads] = await Promise.all([
        Lead.countDocuments(query),
        Lead.find(query)
          .populate('preferredModelId', 'name heroImage startingPrice category')
          .populate('preferredVariantId', 'name variantCode exShowroomPrice fuelType transmission')
          .populate('preferredShowroomId', 'name code city address')
          .populate('assignedConsultantId', 'name email phone activeLeadCount')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
      ]);

      return sendSuccess(res, 'Leads retrieved successfully', leads, 200, {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      });
    } catch (err: any) {
      return sendError(res, 'Failed to fetch leads', 500, err);
    }
  }

  public static async getLeadById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const lead = await Lead.findById(id)
        .populate('preferredModelId')
        .populate('preferredVariantId')
        .populate('preferredShowroomId')
        .populate('assignedConsultantId', 'name email phone showroomId activeLeadCount');

      if (!lead) {
        return sendError(res, `Lead with ID ${id} not found`, 404);
      }

      // Check permission: consultant cannot access other consultants' assigned leads
      if (
        req.user?.role === 'SALES_CONSULTANT' &&
        lead.assignedConsultantId &&
        (lead.assignedConsultantId as any)._id.toString() !== req.user.userId
      ) {
        return sendError(res, 'Unauthorized access to lead assigned to another consultant', 403);
      }

      return sendSuccess(res, 'Lead details retrieved', lead);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch lead details', 500, err);
    }
  }

  public static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const parsed = updateLeadStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const existingLead = await Lead.findById(id);
      if (!existingLead) {
        return sendError(res, `Lead with ID ${id} not found`, 404);
      }

      if (
        req.user?.role === 'SALES_CONSULTANT' &&
        existingLead.assignedConsultantId &&
        existingLead.assignedConsultantId.toString() !== req.user.userId
      ) {
        return sendError(res, 'Unauthorized: You can only update leads assigned to your queue', 403);
      }

      const updated = await LeadAssignmentService.updateStatus(
        id,
        parsed.data.status,
        req.user?.userId,
        req.user?.name || 'Sales Consultant',
        parsed.data.note
      );

      return sendSuccess(res, `Lead status updated to ${parsed.data.status}`, updated);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update lead status', 400, err);
    }
  }

  public static async reassignLead(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const parsed = reassignLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const existingLead = await Lead.findById(id);
      if (!existingLead) {
        return sendError(res, 'Lead not found', 404);
      }

      if (
        req.user?.role === 'SALES_CONSULTANT' &&
        existingLead.assignedConsultantId &&
        existingLead.assignedConsultantId.toString() !== req.user.userId
      ) {
        return sendError(res, 'Unauthorized: You can only reassign leads assigned to your queue', 403);
      }

      const updated = await LeadAssignmentService.reassignLead(
        id,
        parsed.data.newConsultantId,
        parsed.data.reason,
        req.user?.userId,
        req.user?.name || 'Manager'
      );

      return sendSuccess(res, 'Lead reassigned successfully', updated);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to reassign lead', 400, err);
    }
  }

  public static async updateAiDraft(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const parsed = updateDraftSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const lead = await Lead.findById(id);
      if (!lead) {
        return sendError(res, 'Lead not found', 404);
      }

      if (
        req.user?.role === 'SALES_CONSULTANT' &&
        lead.assignedConsultantId &&
        lead.assignedConsultantId.toString() !== req.user.userId
      ) {
        return sendError(res, 'Unauthorized: You can only edit reply drafts for your assigned leads', 403);
      }

      lead.aiFirstReplyDraft.lastEditedContent = parsed.data.editedContent;
      lead.aiFirstReplyDraft.isCustomized = true;
      await lead.save();

      return sendSuccess(res, 'First-reply draft saved successfully', lead.aiFirstReplyDraft);
    } catch (err: any) {
      return sendError(res, 'Failed to save draft message', 500, err);
    }
  }

  public static async regenerateAiDraft(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const lead = await Lead.findById(id)
        .populate('preferredModelId')
        .populate('preferredVariantId')
        .populate('preferredShowroomId')
        .populate('assignedConsultantId');

      if (!lead) {
        return sendError(res, 'Lead not found', 404);
      }

      const assignedId = (lead.assignedConsultantId as any)?._id?.toString() || lead.assignedConsultantId?.toString();
      if (
        req.user?.role === 'SALES_CONSULTANT' &&
        assignedId &&
        assignedId !== req.user.userId
      ) {
        return sendError(res, 'Unauthorized: You can only regenerate drafts for your assigned leads', 403);
      }

      const context = {
        customerName: lead.customerName,
        vehicleModelName: (lead.preferredModelId as any)?.name,
        variantName: (lead.preferredVariantId as any)?.name,
        showroomName: (lead.preferredShowroomId as any)?.name,
        budgetRange: lead.budgetRange,
        fuelPreference: lead.fuelPreference,
        transmissionPreference: lead.transmissionPreference,
        purchaseTimeline: lead.purchaseTimeline,
        customerNotes: lead.customerNotes,
        consultantName: (lead.assignedConsultantId as any)?.name,
      };

      const aiReply = await AIService.generateFirstReplyDraft(context);
      lead.aiFirstReplyDraft = {
        content: aiReply.content,
        status: aiReply.status,
        generatedAt: new Date(),
        lastEditedContent: aiReply.content,
        isCustomized: false,
      };

      await lead.save();

      return sendSuccess(res, 'AI reply draft regenerated', lead.aiFirstReplyDraft);
    } catch (err: any) {
      return sendError(res, 'Failed to regenerate draft', 500, err);
    }
  }

  public static async getLeadAnalytics(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const matchFilter: any = {};
      if (user.role === 'SALES_CONSULTANT') {
        matchFilter.assignedConsultantId = user.userId;
      }

      const [totalLeads, newLeads, assignedLeads, contactedLeads, convertedLeads, lostLeads] =
        await Promise.all([
          Lead.countDocuments(matchFilter),
          Lead.countDocuments({ ...matchFilter, status: 'NEW' }),
          Lead.countDocuments({ ...matchFilter, status: 'ASSIGNED' }),
          Lead.countDocuments({ ...matchFilter, status: 'CONTACTED' }),
          Lead.countDocuments({ ...matchFilter, status: 'CONVERTED' }),
          Lead.countDocuments({ ...matchFilter, status: 'LOST' }),
        ]);

      // Calculate conversion rate
      const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

      // Calculate average response time for contacted leads
      const responseTimes = await Lead.aggregate([
        { $match: { ...matchFilter, responseTimeSeconds: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgResponseTime: { $avg: '$responseTimeSeconds' } } },
      ]);

      const avgResponseTimeSeconds = Math.round(responseTimes[0]?.avgResponseTime || 145);

      // Pending responses within 5m SLA
      const pendingResponses = await Lead.countDocuments({
        ...matchFilter,
        status: 'ASSIGNED',
        firstContactedAt: { $exists: false },
      });

      return sendSuccess(res, 'Lead analytics retrieved', {
        totalLeads,
        newLeads,
        assignedLeads,
        contactedLeads,
        convertedLeads,
        lostLeads,
        pendingResponses,
        conversionRate: `${conversionRate}%`,
        avgResponseTimeSeconds,
        avgResponseTimeFormatted: `${Math.floor(avgResponseTimeSeconds / 60)}m ${avgResponseTimeSeconds % 60}s`,
      });
    } catch (err: any) {
      return sendError(res, 'Failed to fetch analytics', 500, err);
    }
  }
}
