import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { UsedVehicle } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { formatINR, formatKm, formatDate, maskRegNumber } from '../utils/format.js';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Gauge,
  Fuel,
  User,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const UsedCarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<UsedVehicle | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.usedVehicles
      .getById(id)
      .then((res) => {
        if (res.success && res.data) {
          setVehicle(res.data);
          setActiveImage(res.data.images[0]);
        }
      })
      .catch((err) => setError(err.message || 'Used vehicle not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <ShieldCheck className="w-10 h-10 animate-bounce text-emerald-600" />
        <p className="text-xs font-semibold">Loading certified inspection data...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Vehicle Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Certified vehicle record not found.'}</p>
        <Link to="/used-vehicles" className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
          Back to Certified Used Cars
        </Link>
      </div>
    );
  }

  const isStaff = role === 'ADMIN' || role === 'SALES_CONSULTANT';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/used-vehicles" className="hover:text-blue-600">Certified Used Cars</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">{vehicle.model} {vehicle.variant}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-950 shadow-premium border border-slate-200">
            <img
              src={activeImage || vehicle.images[0]}
              alt={`${vehicle.model} ${vehicle.variant}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-600 text-white">
                Certified Pre-Owned
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
                {vehicle.year} Model
              </span>
            </div>

            {/* Masked Registration Notice */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Registration Masked: <strong className="font-mono text-emerald-300">{maskRegNumber(vehicle.registrationNumber)}</strong></span>
              </div>
              <span className="text-[10px] text-slate-400">DPDP Privacy Protected</span>
            </div>
          </div>

          {vehicle.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {vehicle.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={img} alt={`Angle ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Vehicle Specs, Price & CTAs */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Stock ID: {vehicle.stockId}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  vehicle.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {vehicle.status}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">
              {vehicle.model} <span className="font-normal text-slate-600">{vehicle.variant}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Located at {(vehicle.showroomId as any)?.name || 'DriveX Lucknow Certified Yard'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-600 font-bold uppercase block">Kilometres</span>
              <strong className="text-sm font-bold text-slate-900">{formatKm(vehicle.kilometres)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 font-bold uppercase block">Fuel & Trans</span>
              <strong className="text-sm font-bold text-slate-900">{vehicle.fuelType} • {vehicle.transmission}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 font-bold uppercase block">Ownership</span>
              <strong className="text-sm font-bold text-slate-900">
                {vehicle.previousOwners === 1 ? '1st Owner' : `${vehicle.previousOwners} Owners`}
              </strong>
            </div>
          </div>

          {/* Price Card */}
          <div className="p-6 rounded-2xl bg-slate-950 text-white space-y-4 shadow-premium">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                DriveX Certified Asking Price
              </span>
              <span className="font-display font-extrabold text-3xl text-white">
                {formatINR(vehicle.askingPrice)}
              </span>
            </div>

            <Link
              to={`/enquiry?usedCarStockId=${vehicle.stockId}&model=${encodeURIComponent(vehicle.model)}`}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Schedule Inspection & Test Drive Walkthrough</span>
            </Link>
          </div>

          {/* AI Used-Car Price Band Suggestion (Staff Only) */}
          {isStaff && vehicle.suggestedPriceBand && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold uppercase text-[10px] text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Internal AI Fair Market Price Benchmark (Staff Only)</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span>Algorithmic Valuation Band:</span>
                <span className="font-mono font-bold text-indigo-900">
                  {formatINR(vehicle.suggestedPriceBand.min)} – {formatINR(vehicle.suggestedPriceBand.max)}
                </span>
              </div>
              <p className="text-[10px] text-indigo-600">
                Calibrated on regional certified transactions in Lucknow region. Never shown to buyers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 150-Point Certified Inspection Certificate Section */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-premium space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                150-Point Certified Technical Inspection Report
              </h3>
              <p className="text-xs text-slate-500">
                Certified by: {vehicle.inspectionReport?.certifiedBy} on {formatDate(vehicle.inspectionReport?.inspectionDate)}
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-sm">
            Overall Rating: {vehicle.inspectionReport?.rating} / 5.0
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-600">Engine & Drivetrain</span>
            <strong className="text-slate-900 block font-semibold">{vehicle.inspectionReport?.engineCondition}</strong>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Certified Healthy
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-600">Tyres & Wheels</span>
            <strong className="text-slate-900 block font-semibold">{vehicle.inspectionReport?.tyresCondition}</strong>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Tread Depth
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-600">Electricals & Battery</span>
            <strong className="text-slate-900 block font-semibold">{vehicle.inspectionReport?.batteryCondition}</strong>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High-Voltage / 12V Tested
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-600">Body & Structural Integrity</span>
            <strong className="text-slate-900 block font-semibold">{vehicle.inspectionReport?.bodyCondition}</strong>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero Structural Collision
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
