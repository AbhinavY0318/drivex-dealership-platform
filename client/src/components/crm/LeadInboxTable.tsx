import React, { useState } from 'react';
import { Lead } from '../../types/index.js';
import { SLACountdownTimer } from './SLACountdownTimer.js';
import { formatDate } from '../../utils/format.js';
import { Search, Filter, Eye, Phone, Mail, ArrowUpDown, ChevronRight } from 'lucide-react';

interface LeadInboxTableProps {
  leads: Lead[];
  loading: boolean;
  onSelectLead: (lead: Lead) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const STATUS_FILTERS = [
  { label: 'All Leads', value: 'ALL' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Qualified', value: 'QUALIFIED' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'Lost', value: 'LOST' },
];

export const LeadInboxTable: React.FC<LeadInboxTableProps> = ({
  leads,
  loading,
  onSelectLead,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-premium overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by customer, phone, lead #..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onStatusChange(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === f.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Lead Info</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Vehicle Preference</th>
              <th className="px-5 py-3.5">Showroom</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">5m SLA Timer</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-5 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No leads found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search keywords.</p>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const statusColor =
                  lead.status === 'CONVERTED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : lead.status === 'LOST'
                    ? 'bg-red-100 text-red-800'
                    : lead.status === 'CONTACTED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800';

                return (
                  <tr
                    key={lead._id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Lead Ref */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-blue-600 block">{lead.leadNumber}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(lead.createdAt)}</span>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <strong className="text-slate-900 block font-semibold">{lead.customerName}</strong>
                      <span className="text-[11px] text-slate-500">{lead.phone}</span>
                    </td>

                    {/* Vehicle */}
                    <td className="px-5 py-4">
                      <strong className="text-slate-800 block">
                        {(lead.preferredModelId as any)?.name || 'General Inquiry'}
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        {lead.budgetRange || 'Flexible Budget'}
                      </span>
                    </td>

                    {/* Showroom */}
                    <td className="px-5 py-4">
                      <span className="text-slate-700">
                        {(lead.preferredShowroomId as any)?.name?.replace('DriveX ', '') || 'Lucknow Hub'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* 5-Min SLA Timer */}
                    <td className="px-5 py-4">
                      <SLACountdownTimer
                        responseDueAt={lead.responseDueAt}
                        firstContactedAt={lead.firstContactedAt}
                        responseTimeSeconds={lead.responseTimeSeconds}
                        status={lead.status}
                      />
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
