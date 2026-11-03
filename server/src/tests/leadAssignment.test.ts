import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { LeadAssignmentService } from '../services/leadAssignmentService.js';
import { connectDB, disconnectDB, clearDB } from '../config/db.js';
import { Showroom } from '../models/Showroom.js';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { LeadAssignmentHistory } from '../models/LeadAssignmentHistory.js';

describe('Deterministic Lead Assignment & SLA Workflow', () => {
  beforeAll(async () => {
    await connectDB();
    await clearDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should enforce DPDP consent validation and reject enquiries without explicit consent', async () => {
    const showroom = await Showroom.create({
      name: 'Lucknow Central Showroom',
      code: 'LKO-TEST',
      address: 'Hazratganj',
      city: 'Lucknow',
      pincode: '226001',
      phone: '9999999999',
      email: 'test@drivex.in',
    });

    await expect(
      LeadAssignmentService.createAndAssignLead({
        customerName: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9876543210',
        consentGiven: false, // NO CONSENT
        preferredShowroomId: showroom._id.toString(),
      })
    ).rejects.toThrow(/DPDP Compliance Error/);
  });

  it('should deterministically assign lead to the consultant with the lowest active lead count', async () => {
    const showroom = await Showroom.findOne({ code: 'LKO-TEST' });

    // Consultant 1: active workload = 3
    const c1 = await User.create({
      name: 'Consultant Busy',
      email: 'busy@drivex.in',
      passwordHash: 'dummy',
      role: 'SALES_CONSULTANT',
      phone: '9898989801',
      showroomId: showroom!._id,
      activeLeadCount: 3,
      isAvailable: true,
      lastAssignedAt: new Date(Date.now() - 50000),
    });

    // Consultant 2: active workload = 1 (LOWER WORKLOAD -> SHOULD WIN)
    const c2 = await User.create({
      name: 'Consultant Free',
      email: 'free@drivex.in',
      passwordHash: 'dummy',
      role: 'SALES_CONSULTANT',
      phone: '9898989802',
      showroomId: showroom!._id,
      activeLeadCount: 1,
      isAvailable: true,
      lastAssignedAt: new Date(Date.now() - 10000),
    });

    const lead = await LeadAssignmentService.createAndAssignLead({
      customerName: 'Kavita Rao',
      email: 'kavita@example.com',
      phone: '9876543211',
      consentGiven: true,
      preferredShowroomId: showroom!._id.toString(),
      budgetRange: '10-15 Lakh',
    });

    expect(lead.assignedConsultantId?.toString()).toBe(c2._id.toString());
    expect(lead.status).toBe('ASSIGNED');

    // 5-minute SLA timer verification
    expect(lead.responseDueAt).toBeDefined();
    const diffMinutes = (lead.responseDueAt!.getTime() - lead.assignedAt!.getTime()) / 60000;
    expect(Math.round(diffMinutes)).toBe(5);

    // Verify consultant workload incremented
    const updatedC2 = await User.findById(c2._id);
    expect(updatedC2?.activeLeadCount).toBe(2);

    // Verify assignment history saved
    const history = await LeadAssignmentHistory.findOne({ leadId: lead._id });
    expect(history).toBeDefined();
    expect(history?.newConsultantId.toString()).toBe(c2._id.toString());
    expect(history?.assignmentStrategy).toContain('ROUND_ROBIN_LOWEST_WORKLOAD');
  });

  it('should handle lead status transitions and decrement consultant active workload upon conversion or loss', async () => {
    const lead = await Lead.findOne({ customerName: 'Kavita Rao' });
    expect(lead).toBeDefined();

    const consultantId = lead!.assignedConsultantId;
    const initialConsultant = await User.findById(consultantId);
    const initialWorkload = initialConsultant!.activeLeadCount;

    // Contact the lead
    const contacted = await LeadAssignmentService.updateStatus(
      lead!._id.toString(),
      'CONTACTED',
      consultantId?.toString(),
      'Consultant Free',
      'Spoke to customer on phone'
    );
    expect(contacted.status).toBe('CONTACTED');
    expect(contacted.firstContactedAt).toBeDefined();

    // Workload remains active while in progress
    const midConsultant = await User.findById(consultantId);
    expect(midConsultant?.activeLeadCount).toBe(initialWorkload);

    // Convert the lead
    const converted = await LeadAssignmentService.updateStatus(
      lead!._id.toString(),
      'CONVERTED',
      consultantId?.toString(),
      'Consultant Free',
      'Booking finalized and payment advance made'
    );
    expect(converted.status).toBe('CONVERTED');

    // Workload should decrement by 1 upon conversion
    const finalConsultant = await User.findById(consultantId);
    expect(finalConsultant?.activeLeadCount).toBe(initialWorkload - 1);
  });
});
