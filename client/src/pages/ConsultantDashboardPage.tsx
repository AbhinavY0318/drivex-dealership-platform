import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Lead, LeadAnalytics } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { LeadInboxTable } from '../components/crm/LeadInboxTable.js';
import { LeadDetailDrawer } from '../components/crm/LeadDetailDrawer.js';
import { ReassignModal } from '../components/crm/ReassignModal.js';
import {
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Inbox,
  LayoutDashboard,
} from 'lucide-react';

export const ConsultantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<LeadAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const [leadsRes, analyticsRes] = await Promise.all([
        api.leads.getAll(params),
        api.leads.getAnalytics(),
      ]);

      if (leadsRes.success && leadsRes.data) setLeads(leadsRes.data);
      if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, searchQuery]);

  const handleOpenLead = async (lead: Lead) => {
    // Fetch full lead with populated details
    try {
      const res = await api.leads.getById(lead._id);
      if (res.success && res.data) {
        setSelectedLead(res.data);
      } else {
        setSelectedLead(lead);
      }
    } catch {
      setSelectedLead(lead);
    }
  };

  const handleStatusUpdated = () => {
    fetchDashboardData();
    if (selectedLead) {
      api.leads.getById(selectedLead._id).then((res) => {
        if (res.success && res.data) setSelectedLead(res.data);
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <LayoutDashboard className="w-4 h-4" />
            <span>Sales Relationship Manager Portal</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight mt-1">
            Sales Consultant CRM & Lead Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{user?.name}</strong> • Active Showroom Queue:{' '}
            <strong>{(user?.showroomId as any)?.name || 'Hazratganj Flagship'}</strong>
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Leads Assigned</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 block">
            {analytics?.totalLeads || 0}
          </span>
          <span className="text-[10px] text-slate-400">Lifetime queue records</span>
        </div>

        {/* Pending Responses SLA */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Pending 5m SLA Action
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="font-display font-extrabold text-2xl sm:text-3xl text-amber-600 block">
            {analytics?.pendingResponses || 0}
          </span>
          <span className="text-[10px] text-amber-700 font-medium">Awaiting first contact</span>
        </div>

        {/* Converted Leads */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Converted Vehicles
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-600 block">
            {analytics?.convertedLeads || 0}
          </span>
          <span className="text-[10px] text-slate-400">
            Conversion Rate: <strong>{analytics?.conversionRate || '0.0%'}</strong>
          </span>
        </div>

        {/* Avg Response Time */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Average Response Speed
            </span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-display font-extrabold text-2xl sm:text-3xl text-blue-600 block">
            {analytics?.avgResponseTimeFormatted || '2m 25s'}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Well within 5-min target</span>
        </div>
      </div>

      {/* Main Inbox Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-600" />
            <span>Assigned Customer Inquiries</span>
          </h3>
          <span className="text-xs text-slate-500">{leads.length} leads in view</span>
        </div>

        <LeadInboxTable
          leads={leads}
          loading={loading}
          onSelectLead={handleOpenLead}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Slide-out Full Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusUpdated={handleStatusUpdated}
        onOpenReassign={() => setIsReassignModalOpen(true)}
      />

      {/* Reassignment Modal */}
      {selectedLead && (
        <ReassignModal
          isOpen={isReassignModalOpen}
          onClose={() => setIsReassignModalOpen(false)}
          leadId={selectedLead._id}
          leadNumber={selectedLead.leadNumber}
          currentConsultantName={(selectedLead.assignedConsultantId as any)?.name}
          onReassigned={() => {
            fetchDashboardData();
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
};
