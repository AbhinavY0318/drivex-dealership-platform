import React, { useState } from 'react';
import { Lead, LeadStatus } from '../../types/index.js';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';
import { SLACountdownTimer } from './SLACountdownTimer.js';
import { formatDate, formatINR } from '../../utils/format.js';
import {
  X,
  Sparkles,
  Bot,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  RotateCw,
  Save,
  ShieldCheck,
  Tag,
  ArrowRightLeft,
  Loader2,
} from 'lucide-react';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onStatusUpdated: () => void;
  onOpenReassign: () => void;
}

const ALL_STATUSES: LeadStatus[] = [
  'NEW',
  'ASSIGNED',
  'CONTACTED',
  'QUALIFIED',
  'TEST_DRIVE_SCHEDULED',
  'CONVERTED',
  'LOST',
];

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onStatusUpdated,
  onOpenReassign,
}) => {
  const [draftContent, setDraftContent] = useState<string>(
    lead?.aiFirstReplyDraft?.lastEditedContent || lead?.aiFirstReplyDraft?.content || ''
  );
  const [savingDraft, setSavingDraft] = useState<boolean>(false);
  const [regeneratingDraft, setRegeneratingDraft] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string>('');
  const toast = useToast();

  React.useEffect(() => {
    if (lead) {
      setDraftContent(lead.aiFirstReplyDraft?.lastEditedContent || lead.aiFirstReplyDraft?.content || '');
    }
  }, [lead]);

  if (!lead) return null;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === lead.status) return;
    setUpdatingStatus(true);
    try {
      const res = await api.leads.updateStatus(lead._id, newStatus, statusNote);
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        setStatusNote('');
        onStatusUpdated();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const res = await api.leads.updateDraft(lead._id, draftContent);
      if (res.success) {
        toast.success('Reply draft saved successfully');
        onStatusUpdated();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleRegenerateDraft = async () => {
    setRegeneratingDraft(true);
    try {
      const res = await api.leads.regenerateDraft(lead._id);
      if (res.success && res.data) {
        setDraftContent(res.data.content);
        toast.success('First-reply draft regenerated with AI');
        onStatusUpdated();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to regenerate draft');
    } finally {
      setRegeneratingDraft(false);
    }
  };

  const copyDraftToClipboard = () => {
    navigator.clipboard.writeText(draftContent);
    toast.info('Draft copied to clipboard');
  };

  const isAIGenerated = lead.aiSummary?.status === 'GENERATED';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 bg-slate-950 text-white flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                {lead.leadNumber}
              </span>
              <span className="text-xs text-slate-400">Source: {lead.source}</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">
              {lead.customerName}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>{lead.phone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{lead.email}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SLA & Status Header Strip */}
        <div className="px-6 py-3.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">5-Min Response SLA:</span>
            <SLACountdownTimer
              responseDueAt={lead.responseDueAt}
              firstContactedAt={lead.firstContactedAt}
              responseTimeSeconds={lead.responseTimeSeconds}
              status={lead.status}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Status:</span>
            <select
              value={lead.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* AI Requirement Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 border border-blue-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-900">
                  AI Buyer Requirement Summary
                </h4>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isAIGenerated
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {lead.aiSummary?.status === 'GENERATED' ? '✦ Gemini AI Generated' : '✦ Deterministic Fallback'}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {lead.aiSummary?.content || 'Buyer requirements currently being analyzed...'}
            </p>
          </div>

          {/* Quick Vehicle & Showroom Preferences */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">Preferred Model</span>
              <strong className="text-slate-900 block font-semibold">
                {(lead.preferredModelId as any)?.name || 'General Inquiry'}
                {(lead.preferredVariantId as any)?.name ? ` - ${(lead.preferredVariantId as any).name}` : ''}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">Showroom Assigned</span>
              <strong className="text-slate-900 block font-semibold">
                {(lead.preferredShowroomId as any)?.name || 'Lucknow Hazratganj'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">Budget & Timeline</span>
              <span className="text-slate-800">
                {lead.budgetRange || 'Flexible'} • {lead.purchaseTimeline || 'Within 1 month'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">Current Consultant</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-semibold">
                  {(lead.assignedConsultantId as any)?.name || 'Unassigned'}
                </span>
                <button
                  onClick={onOpenReassign}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Reassign</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {lead.customerNotes && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Customer Remark / Notes</span>
              <p className="text-slate-800 italic">"{lead.customerNotes}"</p>
            </div>
          )}

          {/* Stored Pricing Snapshot (if available) */}
          {lead.pricingSnapshot && (
            <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-2">
              <div className="flex items-center justify-between text-blue-400 font-bold uppercase text-[10px]">
                <span>Attached On-Road Pricing Snapshot</span>
                <span>{lead.pricingSnapshot.city || 'Lucknow'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total On-Road Estimate Quoted:</span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  {formatINR(lead.pricingSnapshot.totalOnRoadPrice)}
                </span>
              </div>
            </div>
          )}

          {/* AI First-Reply Draft Composer */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <h4 className="font-display font-bold text-sm text-slate-900">
                  AI First-Reply Assistant (Editable)
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRegenerateDraft}
                  disabled={regeneratingDraft}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors title='Regenerate with AI'"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${regeneratingDraft ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={copyDraftToClipboard}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors title='Copy Draft'"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed font-sans text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Draft your personalized message..."
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-600">
                Never sent automatically. Review and edit before communicating.
              </span>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {savingDraft ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                <span>Save Draft</span>
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-slate-900">Activity & Audit Timeline</h4>
            <div className="space-y-3 relative pl-4 before:absolute before:top-2 before:bottom-2 before:left-1.5 before:w-0.5 before:bg-slate-200">
              {lead.activityTimeline?.map((item, idx) => (
                <div key={idx} className="relative text-xs space-y-0.5">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {item.performedByName || 'System Auto-Engine'}
                    </span>
                    <span className="text-[10px]">{formatDate(item.timestamp)}</span>
                  </div>
                  <p className="text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DPDP Consent Record */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              DPDP Explicit Consent recorded at: <strong>{formatDate(lead.consentTimestamp)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
