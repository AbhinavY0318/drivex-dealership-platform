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
  ArrowLeft,
  Phone,
  MapPin,
  Sparkles,
  Check,
  FileCheck,
} from 'lucide-react';

export const TestDriveBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedShowroomId = searchParams.get('showroomId');
  const preSelectedModelSlug = searchParams.get('modelSlug');
  const preSelectedVariantId = searchParams.get('variantId');

  const { user } = useAuth();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
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

  // Customer form fields
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
        if (preSelectedShowroomId) {
          setSelectedShowroomId(preSelectedShowroomId);
        } else if (shRes.data.length > 0) {
          setSelectedShowroomId(shRes.data[0]._id);
        }
      }
      if (mRes.success && mRes.data) {
        setModels(mRes.data);
        if (preSelectedModelSlug) {
          const match = mRes.data.find((m) => m.slug === preSelectedModelSlug);
          if (match) setSelectedModelId(match._id);
          else if (mRes.data.length > 0) setSelectedModelId(mRes.data[0]._id);
        } else if (mRes.data.length > 0) {
          setSelectedModelId(mRes.data[0]._id);
        }
      }
    });
  }, [preSelectedShowroomId, preSelectedModelSlug]);

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
            const firstAvailable = res.data.find((s) => s.isAvailable);
            if (firstAvailable) setSelectedSlot(firstAvailable.timeSlot);
            else setSelectedSlot('');
          }
        })
        .finally(() => setFetchingSlots(false));
    }
  }, [selectedShowroomId, selectedModelId, bookingDate]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedShowroomId || !selectedModelId) {
        toast.error('Please select both a showroom and vehicle model.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedSlot) {
        toast.error('Please select an available test-drive time slot.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail) {
      toast.error('Please complete all contact details.');
      return;
    }
    if (!consentGiven) {
      toast.error('Please accept the customer communication consent to proceed.');
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
      setCurrentStep(2); // take them back to slot picker
      api.testDrives.getAvailability(selectedShowroomId, selectedModelId, bookingDate).then((sRes) => {
        if (sRes.success && sRes.data) setSlots(sRes.data);
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedShowroom = showrooms.find((s) => s._id === selectedShowroomId);
  const selectedVehicleModel = models.find((m) => m._id === selectedModelId);
  const selectedVariant = variants.find((v) => v._id === selectedVariantId);

  // Success Screen
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 sm:p-12 text-center space-y-7">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Ref: {confirmedBooking.bookingReference}
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight mt-2">
              Test Drive Appointment Confirmed
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your test drive has been atomically reserved. Our sales consultant will have the demo car sanitised, fueled, and waiting.
            </p>
          </div>

          {/* Boarding Pass Style Card */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white text-left grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border border-slate-800">
            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px] tracking-wider">Vehicle Reserved</span>
              <strong className="text-base font-bold text-white block mt-1">
                {selectedVehicleModel?.name} {selectedVariant?.name}
              </strong>
              <span className="text-blue-400 text-[11px] block mt-0.5">Demo Fleet Allocated</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px] tracking-wider">Date & Time Slot</span>
              <strong className="text-base font-bold text-emerald-400 block mt-1">
                {confirmedBooking.bookingDate}
              </strong>
              <span className="text-slate-300 block">{confirmedBooking.timeSlot}</span>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <span className="text-slate-400 font-bold uppercase block text-[10px] tracking-wider">Showroom Hub</span>
              <strong className="text-sm font-bold text-white block mt-0.5">
                {selectedShowroom?.name}
              </strong>
              <p className="text-slate-400 text-[11px] mt-0.5">{selectedShowroom?.address}</p>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <span className="text-slate-400 font-bold uppercase block text-[10px] tracking-wider">Guest Driver</span>
              <strong className="text-sm font-bold text-white block mt-0.5">{confirmedBooking.customerName}</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">{confirmedBooking.customerPhone}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/my-bookings"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow transition-all"
            >
              View My Bookings & Pass
            </Link>
            <Link
              to="/vehicles"
              className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Explore Other Models
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <CalendarCheck className="w-4 h-4" />
          <span>Real-Time Demo Fleet Scheduling</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Reserve Your Lucknow Test Drive
        </h1>
        <p className="text-xs text-slate-500">
          Guided 3-step concierge reservation with atomic double-booking collision prevention across all 3 Lucknow showrooms.
        </p>
      </div>

      {/* Multi-Step Indicator */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
        {[
          { step: 1, title: 'Vehicle & Showroom' },
          { step: 2, title: 'Date & Slot' },
          { step: 3, title: 'Driver Information' },
        ].map((s) => (
          <div
            key={s.step}
            className={`p-3 rounded-2xl border text-center transition-all ${
              currentStep === s.step
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : currentStep > s.step
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-wider">
              {currentStep > s.step ? 'Completed' : `Step 0${s.step}`}
            </span>
            <span className="block text-xs font-bold truncate mt-0.5">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Main Multi-Step Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-premium">
        {/* =========================================================================
            STEP 1: VEHICLE & SHOWROOM SELECTION
        ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in">
            {/* Showroom Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                1. Select Preferred Lucknow Showroom:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {showrooms.map((sh) => {
                  const isSelected = selectedShowroomId === sh._id;
                  return (
                    <button
                      type="button"
                      key={sh._id}
                      onClick={() => setSelectedShowroomId(sh._id)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-900">{sh.name}</strong>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{sh.address}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Select Vehicle Model:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {models.map((m) => {
                  const isSelected = selectedModelId === m._id;
                  return (
                    <button
                      type="button"
                      key={m._id}
                      onClick={() => setSelectedModelId(m._id)}
                      className={`group rounded-2xl border overflow-hidden text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                        <img
                          src={m.heroImage}
                          alt={m.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase glass-dark text-white">
                          {m.category}
                        </span>
                      </div>
                      <div className="p-3">
                        <strong className="text-xs font-bold text-slate-900 block">{m.name}</strong>
                        <span className="text-[10px] text-slate-500">{m.brand} Premier</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                  3. Select Trim / Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      type="button"
                      key={v._id}
                      onClick={() => setSelectedVariantId(v._id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedVariantId === v._id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{v.name}</span>
                      <span className="text-[10px] opacity-70 ml-1">({v.transmission})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1 Actions */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow transition-all"
              >
                <span>Continue to Date & Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: DATE & TIME SLOT SELECTION
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                  Select Appointment Date:
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500">
                  Same-day past dates are strictly blocked. Slots available from tomorrow onwards.
                </p>
              </div>

              {/* Showroom & Car Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Reservation Target:
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedVehicleModel?.name} {selectedVariant?.name}
                </p>
                <p className="text-slate-600">Showroom: {selectedShowroom?.name}</p>
                <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                  Demo Vehicle In-Fleet
                </span>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                  Select Operating Time Slot:
                </label>
                {fetchingSlots && (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1 font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking Fleet Availability...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlot === slot.timeSlot;
                  return (
                    <button
                      type="button"
                      key={slot.timeSlot}
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot.timeSlot)}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        !slot.isAvailable
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-glow'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 font-semibold'
                      }`}
                    >
                      <span className="block text-xs">{slot.timeSlot}</span>
                      <span className="block text-[10px] mt-0.5 opacity-80">
                        {slot.isAvailable ? 'Available' : 'Reserved'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow transition-all"
              >
                <span>Continue to Guest Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: DRIVER CONTACT & DPDP CONSENT
        ========================================================================= */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in">
            {/* Overview Summary Strip */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block tracking-wider font-bold">Booking Target:</span>
                <strong className="text-white text-sm">
                  {selectedVehicleModel?.name} {selectedVariant?.name}
                </strong>
                <p className="text-slate-400 mt-0.5">{selectedShowroom?.name} • {bookingDate} @ {selectedSlot}</p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline uppercase tracking-wider"
              >
                Change Slot
              </button>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="vikram@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Special Driving Requests / Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please arrange for a highway acceleration test drive..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* DPDP Consent */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 leading-relaxed text-[11px]">
                  <strong>DPDP Consent:</strong> I authorize DriveX automotive consultants to contact me via phone, WhatsApp, or email regarding test-drive coordination, vehicle demonstrations, and dealer pricing at the chosen Lucknow showroom.
                </span>
              </label>
            </div>

            {/* Step 3 Actions */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Atomically Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm VIP Test Drive</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
