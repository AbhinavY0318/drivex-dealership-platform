import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatINR, formatKm, formatDate } from '../utils/format.js';
import {
  Sparkles,
  Building2,
  Car,
  Tag,
  Users,
  ShieldCheck,
  TrendingUp,
  Plus,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
  CalendarCheck,
  Clock,
  Eye,
  LayoutDashboard,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'analytics' | 'pricing' | 'staff' | 'used'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [cityPricingList, setCityPricingList] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [usedCars, setUsedCars] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Pricing Rule Form State
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [newRuleCity, setNewRuleCity] = useState<string>('Lucknow');
  const [newRuleExShowroom, setNewRuleExShowroom] = useState<number>(1245000);
  const [newRuleRto, setNewRuleRto] = useState<number>(124500);
  const [newRuleInsurance, setNewRuleInsurance] = useState<number>(56000);
  const [newRuleAccessories, setNewRuleAccessories] = useState<number>(15000);
  const [newRuleDiscount, setNewRuleDiscount] = useState<number>(20000);

  // New Consultant Form State
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [staffName, setStaffName] = useState<string>('');
  const [staffEmail, setStaffEmail] = useState<string>('');
  const [staffPhone, setStaffPhone] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, pricingRes, staffRes, usedRes] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getPricing(),
        api.admin.getConsultants(),
        api.usedVehicles.getAll({ limit: 20 }),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (pricingRes.success) setCityPricingList(pricingRes.data);
      if (staffRes.success) setConsultants(staffRes.data);
      if (usedRes.success) setUsedCars(usedRes.data);
    } catch (err: any) {
      toast.error('Failed to load administrative records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStaffAvailability = async (consultantId: string) => {
    try {
      const res = await api.admin.toggleAvailability(consultantId);
      if (res.success) {
        toast.success(res.message);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle consultant status');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.admin.createConsultant({
        name: staffName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim(),
        role: 'SALES_CONSULTANT',
      });
      if (res.success) {
        toast.success('Sales consultant added to dealership pool');
        setShowStaffModal(false);
        setStaffName('');
        setStaffEmail('');
        setStaffPhone('');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create consultant');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <Sparkles className="w-4 h-4" />
            <span>Central Management System</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight mt-1">
            Dealership Administration & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lucknow 3 Showrooms, 2 Service Workshops & Certified Yard Control Deck
          </p>
        </div>

        {/* Tab Controls & CRM Shortcut */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/crm/leads"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Open Sales CRM Leads</span>
          </Link>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
            {[
              { id: 'analytics', label: 'Executive KPIs', icon: TrendingUp },
              { id: 'pricing', label: 'City Pricing Engine', icon: Tag },
              { id: 'staff', label: 'Staff & Workload', icon: Users },
              { id: 'used', label: 'Used Inventory', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs">Loading dealership administration telemetry...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: EXECUTIVE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in fade-in">
              {/* High-level KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Total Inquiries Handled
                  </span>
                  <span className="font-display font-extrabold text-3xl text-slate-900 block">
                    {analytics?.kpis?.totalLeads || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">All channels (Website, Portal, Walk-In)</span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Sales Conversion Rate
                  </span>
                  <span className="font-display font-extrabold text-3xl text-emerald-600 block">
                    {analytics?.kpis?.conversionRate || '0.0%'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {analytics?.kpis?.convertedLeads || 0} Deals Finalized
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                    Projected Dealership Revenue
                  </span>
                  <span className="font-display font-extrabold text-3xl text-indigo-900 block">
                    {formatINR(analytics?.kpis?.monthlyRevenue || 7250000)}
                  </span>
                  <span className="text-[10px] text-slate-400">Avg ₹14.5L ticket simulation</span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    Test Drive Utilization
                  </span>
                  <span className="font-display font-extrabold text-3xl text-blue-600 block">
                    {analytics?.kpis?.testDrivesTotal || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">Across 3 Lucknow showrooms</span>
                </div>
              </div>

              {/* Consultant Workload Balance Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-premium space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>Real-Time Consultant Workload Balancing</span>
                  </h3>
                  <span className="text-xs text-slate-500">Auto-assignment lowest workload engine</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analytics?.consultantsWorkload?.map((c: any) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-bold text-slate-900">{c.name}</strong>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              c.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 block">{c.showroom}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-xs text-slate-600">Active Queue:</span>
                        <span className="font-mono text-sm font-bold text-indigo-600">
                          {c.activeLeads} Leads
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CITY PRICING RULES */}
          {activeTab === 'pricing' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-premium p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    City-Specific Regional Pricing Engine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Admin managed road tax, comprehensive insurance, accessories, and validity dates
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">City & State</th>
                      <th className="p-3">Vehicle Variant</th>
                      <th className="p-3">Ex-Showroom</th>
                      <th className="p-3">Road Tax (RTO)</th>
                      <th className="p-3">Insurance</th>
                      <th className="p-3">Accessories Kit</th>
                      <th className="p-3">Festive Discount</th>
                      <th className="p-3">Validity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cityPricingList.map((rule) => (
                      <tr key={rule._id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{rule.city}, {rule.state}</td>
                        <td className="p-3 font-medium text-slate-800">
                          {rule.vehicleVariantId?.name || 'ZX automatic'}
                        </td>
                        <td className="p-3 font-mono text-slate-900 font-bold">{formatINR(rule.exShowroomPrice)}</td>
                        <td className="p-3 font-mono text-slate-700">{formatINR(rule.rtoRoadTax)}</td>
                        <td className="p-3 font-mono text-slate-700">{formatINR(rule.insurance)}</td>
                        <td className="p-3 font-mono text-slate-700">{formatINR(rule.mandatoryAccessories)}</td>
                        <td className="p-3 font-mono text-emerald-600 font-semibold">-{formatINR(rule.offersDiscount)}</td>
                        <td className="p-3 text-slate-500">{formatDate(rule.priceValidityDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STAFF & CONSULTANT MANAGEMENT */}
          {activeTab === 'staff' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-premium p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Sales Consultants & Dealership Staff
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage consultant availability to control automatic lead assignment
                  </p>
                </div>

                <button
                  onClick={() => setShowStaffModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Consultant</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Staff Name</th>
                      <th className="p-3">Email & Phone</th>
                      <th className="p-3">Showroom Location</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Active Leads</th>
                      <th className="p-3">Auto-Routing Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consultants.map((c) => (
                      <tr key={c._id || c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{c.name}</td>
                        <td className="p-3 text-slate-600">
                          <div>{c.email}</div>
                          <div className="text-[10px] text-slate-400">{c.phone}</div>
                        </td>
                        <td className="p-3 text-slate-700">{c.showroomId?.name || 'Lucknow Central'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                            {c.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-indigo-600">{c.activeLeadCount || 0}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {c.isAvailable ? 'Available for Leads' : 'Offline / On Leave'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleStaffAvailability(c._id || c.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px]"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CERTIFIED USED INVENTORY */}
          {activeTab === 'used' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-premium p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Certified Used Car Inventory Registry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Full vehicle details with masked registration and technical certificates
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Stock ID</th>
                      <th className="p-3">Model & Variant</th>
                      <th className="p-3">Year / KM</th>
                      <th className="p-3">Registration (Masked)</th>
                      <th className="p-3">Asking Price</th>
                      <th className="p-3">Inspection Rating</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usedCars.map((uc) => (
                      <tr key={uc._id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{uc.stockId}</td>
                        <td className="p-3 font-semibold text-slate-800">
                          {uc.model} {uc.variant}
                        </td>
                        <td className="p-3 text-slate-600">
                          {uc.year} • {formatKm(uc.kilometres)}
                        </td>
                        <td className="p-3 font-mono text-slate-700">{uc.registrationNumber}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{formatINR(uc.askingPrice)}</td>
                        <td className="p-3 text-emerald-700 font-bold">★ {uc.inspectionReport?.rating} / 5.0</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              uc.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {uc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Staff Consultant Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Add Sales Consultant</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Full Name</span>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Alok Mishra"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Email Address</span>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="alok.mishra@drivex.in"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Phone Number</span>
                <input
                  type="tel"
                  required
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="9839099887"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-glow"
                >
                  Save Consultant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
