import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { Showroom, VehicleModel, VehicleVariant } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { useAuth } from '../context/AuthContext.js';
import { formatINR } from '../utils/format.js';
import {
  FileText,
  Building2,
  Car,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowRight,
  User,
} from 'lucide-react';

export const EnquiryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const stateData = location.state as {
    preferredModelId?: string;
    preferredVariantId?: string;
    pricingSnapshot?: any;
    usedCarStockId?: string;
    model?: string;
  } | null;

  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);

  const [customerName, setCustomerName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [preferredShowroomId, setPreferredShowroomId] = useState<string>('');
  const [preferredModelId, setPreferredModelId] = useState<string>(stateData?.preferredModelId || '');
  const [budgetRange, setBudgetRange] = useState<string>('₹12 Lakh - ₹16 Lakh');
  const [fuelPreference, setFuelPreference] = useState<string>('Petrol');
  const [transmissionPreference, setTransmissionPreference] = useState<string>('Automatic');
  const [purchaseTimeline, setPurchaseTimeline] = useState<string>('Within 2 weeks');
  const [customerNotes, setCustomerNotes] = useState<string>(
    stateData?.usedCarStockId ? `Enquiring on certified used car ${stateData.usedCarStockId}` : ''
  );
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [leadReceipt, setLeadReceipt] = useState<any>(null);

  useEffect(() => {
    Promise.all([api.showrooms.getAll(), api.vehicles.getAll()]).then(([shRes, mRes]) => {
      if (shRes.success && shRes.data) {
        setShowrooms(shRes.data);
        if (shRes.data.length > 0) setPreferredShowroomId(shRes.data[0]._id);
      }
      if (mRes.success && mRes.data) {
        setModels(mRes.data);
        if (!preferredModelId && mRes.data.length > 0) {
          setPreferredModelId(mRes.data[0]._id);
        }
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      toast.error('Explicit DPDP consent is mandatory to process customer enquiries.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.leads.create({
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        consentGiven: true,
        consentPurpose: 'Authorized vehicle purchase, quote simulation, and test drive coordination.',
        preferredShowroomId,
        preferredModelId: preferredModelId || undefined,
        preferredVariantId: stateData?.preferredVariantId || undefined,
        budgetRange,
        fuelPreference,
        transmissionPreference,
        purchaseTimeline,
        customerNotes: customerNotes.trim(),
        pricingSnapshot: stateData?.pricingSnapshot || undefined,
      });

      if (res.success && res.data) {
        setLeadReceipt(res.data);
        toast.success('Enquiry successfully submitted and assigned to your dedicated consultant!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (leadReceipt) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Lead #{leadReceipt.leadNumber}
            </span>
            <h2 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight mt-2">
              Enquiry Received!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our auto-assignment engine has paired your enquiry with an active senior sales consultant.
            </p>
          </div>

          {/* SLA Commitment Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs text-left flex items-center gap-3">
            <Clock className="w-6 h-6 shrink-0" />
            <div>
              <strong className="block text-sm font-bold">5-Minute Response Commitment Active</strong>
              <span className="text-blue-100 text-[11px]">
                Your relationship manager has received an automated high-priority alert and will connect shortly.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/vehicles"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-glow hover:bg-blue-500"
            >
              Browse More Cars
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <FileText className="w-4 h-4" />
          <span>Vehicle Purchase & Pricing Consultation</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Submit Dealership Purchase Enquiry
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Receive personalized Lucknow on-road price sheets, exchange valuations, and tailored financing options.
        </p>
      </div>

      {/* Snapshot Alert Banner if user clicked "Enquire with this Quote" from Pricing Modal */}
      {stateData?.pricingSnapshot && (
        <div className="p-4 rounded-2xl bg-slate-950 text-white text-xs flex items-center justify-between border border-slate-800 shadow-premium">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <div>
              <span className="font-bold text-white block">Attached Official Price Snapshot</span>
              <span className="text-slate-400 text-[11px]">
                {stateData.pricingSnapshot.modelName} • {stateData.pricingSnapshot.city} RTO Tariff
              </span>
            </div>
          </div>
          <span className="font-mono text-base font-extrabold text-emerald-400">
            {formatINR(stateData.pricingSnapshot.totalOnRoadPrice)}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-premium space-y-6">
        {/* Customer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Full Name *</span>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Phone Number *</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9839012345"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Email Address *</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@drivex.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Preferred Showroom in Lucknow *</span>
            <select
              value={preferredShowroomId}
              onChange={(e) => setPreferredShowroomId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {showrooms.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Vehicle of Interest</span>
            <select
              value={preferredModelId}
              onChange={(e) => setPreferredModelId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {models.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Budget Range</span>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="Under ₹10 Lakh">Under ₹10 Lakh</option>
              <option value="₹10 Lakh - ₹15 Lakh">₹10 Lakh - ₹15 Lakh</option>
              <option value="₹15 Lakh - ₹20 Lakh">₹15 Lakh - ₹20 Lakh</option>
              <option value="₹20 Lakh+">₹20 Lakh+</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Fuel & Transmission</span>
            <div className="flex gap-2">
              <select
                value={fuelPreference}
                onChange={(e) => setFuelPreference(e.target.value)}
                className="w-1/2 px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
              <select
                value={transmissionPreference}
                onChange={(e) => setTransmissionPreference(e.target.value)}
                className="w-1/2 px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Purchase Timeline</span>
            <select
              value={purchaseTimeline}
              onChange={(e) => setPurchaseTimeline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="Immediate (This week)">Immediate (This week)</option>
              <option value="Within 2 weeks">Within 2 weeks</option>
              <option value="Next 30 days">Next 30 days</option>
              <option value="Just researching">Just researching</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-700">Additional Remarks / Questions</span>
          <textarea
            rows={3}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="e.g. Inquiring about current trade-in valuation on my old vehicle and delivery waiting periods..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* DPDP Consent Checkbox */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 accent-blue-600"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            I consent to DriveX contacting me regarding vehicle specifications, on-road price estimates, and test drive
            coordination under the Digital Personal Data Protection Act 2023.
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Routing to Available Sales Consultant...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Submit Dealership Enquiry (5-Min Response SLA)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
