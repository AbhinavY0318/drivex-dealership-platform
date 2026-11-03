import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Showroom, VehicleModel, VehicleVariant, TestDriveBooking } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
  CalendarCheck,
  Building2,
  Car,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Phone,
  MapPin,
} from 'lucide-react';

export const TestDriveBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedShowroomId = searchParams.get('showroomId');
  const preSelectedModelId = searchParams.get('modelId');
  const preSelectedVariantId = searchParams.get('variantId');

  const { user } = useAuth();
  const toast = useToast();

  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [variants, setVariants] = useState<VehicleVariant[]>([]);

  const [selectedShowroomId, setSelectedShowroomId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  // Default date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState<string>(minDate);
  const [slots, setSlots] = useState<{ timeSlot: string; isAvailable: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [fetchingSlots, setFetchingSlots] = useState<boolean>(false);

  // Form fields
  const [customerName, setCustomerName] = useState<string>(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
  const [notes, setNotes] = useState<string>('');
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<TestDriveBooking | null>(null);

  // Fetch initial showrooms & models
  useEffect(() => {
    Promise.all([api.showrooms.getAll(), api.vehicles.getAll()]).then(([shRes, mRes]) => {
      if (shRes.success && shRes.data) {
        setShowrooms(shRes.data);
        if (preSelectedShowroomId) setSelectedShowroomId(preSelectedShowroomId);
        else if (shRes.data.length > 0) setSelectedShowroomId(shRes.data[0]._id);
      }
      if (mRes.success && mRes.data) {
        setModels(mRes.data);
        if (preSelectedModelId) setSelectedModelId(preSelectedModelId);
        else if (mRes.data.length > 0) setSelectedModelId(mRes.data[0]._id);
      }
    });
  }, [preSelectedShowroomId, preSelectedModelId]);

  // When model changes, fetch its variants
  useEffect(() => {
    if (selectedModelId) {
      const selectedModel = models.find((m) => m._id === selectedModelId);
      if (selectedModel) {
        api.vehicles.getBySlug(selectedModel.slug).then((res) => {
          if (res.success && res.data) {
            setVariants(res.data.variants);
            if (preSelectedVariantId) {
              setSelectedVariantId(preSelectedVariantId);
            } else if (res.data.variants.length > 0) {
              setSelectedVariantId(res.data.variants[0]._id);
            }
          }
        });
      }
    }
  }, [selectedModelId, models, preSelectedVariantId]);

  // Fetch slot availability whenever showroom, model, or date changes
  useEffect(() => {
    if (selectedShowroomId && selectedModelId && bookingDate) {
      setFetchingSlots(true);
      api.testDrives
        .getAvailability(selectedShowroomId, selectedModelId, bookingDate)
        .then((res) => {
          if (res.success && res.data) {
            setSlots(res.data);
            // Select first available slot
            const firstAvailable = res.data.find((s) => s.isAvailable);
            if (firstAvailable) setSelectedSlot(firstAvailable.timeSlot);
            else setSelectedSlot('');
          }
        })
        .finally(() => setFetchingSlots(false));
    }
  }, [selectedShowroomId, selectedModelId, bookingDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      toast.error('Please accept the customer communication consent to proceed.');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please choose an available time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.testDrives.book({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        vehicleModelId: selectedModelId,
        vehicleVariantId: selectedVariantId || undefined,
        showroomId: selectedShowroomId,
        bookingDate,
        timeSlot: selectedSlot,
        notes: notes.trim(),
      });

      if (res.success && res.data) {
        setConfirmedBooking(res.data);
        toast.success('Test drive appointment successfully reserved!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Double-booking prevention: Slot already reserved. Please select another slot.');
      // Refresh slots
      api.testDrives.getAvailability(selectedShowroomId, selectedModelId, bookingDate).then((sRes) => {
        if (sRes.success && sRes.data) setSlots(sRes.data);
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedShowroom = showrooms.find((s) => s._id === selectedShowroomId);
  const selectedVehicleModel = models.find((m) => m._id === selectedModelId);

  // Success Confirmation Screen
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Ref: {confirmedBooking.bookingReference}
            </span>
            <h2 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight mt-2">
              Test Drive Confirmed!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your appointment has been atomically reserved. Our dealership executive will have the demo car prepped and waiting.
            </p>
          </div>

          {/* Details Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-600 font-bold uppercase block text-[10px]">Vehicle Model</span>
              <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                {selectedVehicleModel?.name || 'DriveX Model'}
              </strong>
            </div>

            <div>
              <span className="text-slate-600 font-bold uppercase block text-[10px]">Appointment Slot</span>
              <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                {confirmedBooking.bookingDate} • {confirmedBooking.timeSlot}
              </strong>
            </div>

            <div>
              <span className="text-slate-600 font-bold uppercase block text-[10px]">Showroom Location</span>
              <strong className="text-slate-900 block mt-0.5">
                {selectedShowroom?.name || 'Lucknow Showroom'}
              </strong>
              <p className="text-slate-500 mt-0.5">{selectedShowroom?.address}</p>
            </div>

            <div>
              <span className="text-slate-600 font-bold uppercase block text-[10px]">Customer Details</span>
              <strong className="text-slate-900 block mt-0.5">{confirmedBooking.customerName}</strong>
              <p className="text-slate-500 mt-0.5">{confirmedBooking.customerPhone}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/vehicles"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-glow hover:bg-blue-500"
            >
              Explore More Vehicles
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <CalendarCheck className="w-4 h-4" />
          <span>Real-Time Demo Fleet Scheduling</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Book a VIP Test Drive in Lucknow
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Reserve an exclusive 1-on-1 vehicle walkthrough and road evaluation with atomic double-booking prevention.
        </p>
      </div>

      {/* Main Booking Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-premium space-y-8">
        {/* Step 1: Showroom Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Step 1: Select Lucknow Showroom</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {showrooms.map((sh) => (
              <button
                type="button"
                key={sh._id}
                onClick={() => setSelectedShowroomId(sh._id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedShowroomId === sh._id
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {sh.code}
                </span>
                <strong className="text-xs font-bold text-slate-900 block mt-1.5">{sh.name}</strong>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{sh.address}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Vehicle Model & Variant */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
            <Car className="w-4 h-4 text-blue-600" />
            <span>Step 2: Choose Vehicle Model & Variant</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-600 font-semibold">Model:</span>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {models.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-slate-600 font-semibold">Variant:</span>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {variants.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.fuelType} - {v.transmission})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 3 & 4: Date & Available Slots */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Step 3 & 4: Select Preferred Date & Available Time Slot</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-600 font-semibold">Appointment Date:</span>
              <input
                type="date"
                min={minDate}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Slots Grid */}
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Available Showroom Slots:</span>
                {fetchingSlots && (
                  <span className="text-blue-600 flex items-center gap-1 text-[11px]">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    disabled={!s.isAvailable}
                    onClick={() => setSelectedSlot(s.timeSlot)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                      !s.isAvailable
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-dashed border-slate-200 line-through'
                        : selectedSlot === s.timeSlot
                        ? 'bg-blue-600 text-white shadow-glow ring-2 ring-blue-600/30'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{s.timeSlot}</span>
                    <span className="block text-[9px] font-normal mt-0.5">
                      {s.isAvailable ? 'Available' : 'Reserved'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Contact Information */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
            Step 5: Customer Contact & Requirements
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-600 font-semibold">Full Name *</span>
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
              <span className="text-xs text-slate-600 font-semibold">Phone Number *</span>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9839012345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-600 font-semibold">Email Address *</span>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. vikram@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-600 font-semibold">Special Requests / Notes (Optional)</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Interested in comparing boot space and automatic paddle shifters..."
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
              I authorize DriveX Dealership Lucknow to verify slot availability, confirm my appointment via SMS/WhatsApp,
              and process my contact information under the Indian Digital Personal Data Protection (DPDP) Act 2023.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Reserving Verified Demo Slot...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                <span>Confirm VIP Test Drive Reservation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
