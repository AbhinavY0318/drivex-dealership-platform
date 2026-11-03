import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { User } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import { X, UserCheck, ShieldAlert, Loader2 } from 'lucide-react';

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadNumber: string;
  currentConsultantName?: string;
  onReassigned: () => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadNumber,
  currentConsultantName,
  onReassigned,
}) => {
  const [consultants, setConsultants] = useState<User[]>([]);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingStaff, setFetchingStaff] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setFetchingStaff(true);
      api.admin
        .getConsultants()
        .then((res) => {
          if (res.success && res.data) {
            setConsultants(res.data.filter((c) => c.role === 'SALES_CONSULTANT'));
          }
        })
        .catch(() => {
          // If not admin, fallback to staff query
        })
        .finally(() => setFetchingStaff(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultantId) {
      toast.error('Please select an eligible consultant');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please specify a reassignment justification');
      return;
    }

    setLoading(true);
    try {
      const res = await api.leads.reassign(leadId, selectedConsultantId, reason.trim());
      if (res.success) {
        toast.success(`Lead ${leadNumber} reassigned successfully`);
        onReassigned();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reassign lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Reassign Sales Consultant</h3>
              <p className="text-xs text-slate-400">Lead #{leadNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {currentConsultantName && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              Currently Assigned To: <strong className="text-slate-900">{currentConsultantName}</strong>
            </div>
          )}

          {/* Consultant Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Target Sales Consultant:
            </label>
            {fetchingStaff ? (
              <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading available showroom consultants...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 divide-y divide-slate-100">
                {consultants.map((c) => (
                  <label
                    key={c.id || (c as any)._id}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedConsultantId === (c.id || (c as any)._id)
                        ? 'bg-blue-50 border border-blue-300'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="consultant"
                        value={c.id || (c as any)._id}
                        checked={selectedConsultantId === (c.id || (c as any)._id)}
                        onChange={(e) => setSelectedConsultantId(e.target.value)}
                        className="accent-blue-600"
                      />
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">{c.name}</span>
                        <span className="text-xs text-slate-500">{(c.showroomId as any)?.name || 'Lucknow Hub'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                      {c.activeLeadCount || 0} Active Leads
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Reassignment Justification / Audit Note:
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Consultant currently on showroom test drive duty, customer requested immediate follow-up..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-glow flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Reassignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
