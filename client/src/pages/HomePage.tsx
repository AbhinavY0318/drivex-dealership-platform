import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { VehicleModel, UsedVehicle, Showroom } from '../types/index.js';
import { VehicleCard } from '../components/vehicles/VehicleCard.js';
import { UsedVehicleCard } from '../components/used/UsedVehicleCard.js';
import { formatINR } from '../utils/format.js';
import {
  Car,
  ShieldCheck,
  CalendarCheck,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  Phone,
  CheckCircle,
  MapPin,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [newModels, setNewModels] = useState<VehicleModel[]>([]);
  const [usedCars, setUsedCars] = useState<UsedVehicle[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.vehicles.getAll({ limit: 3 }),
      api.usedVehicles.getAll({ limit: 3 }),
      api.showrooms.getAll(),
    ])
      .then(([modelsRes, usedRes, showroomsRes]) => {
        if (modelsRes.success && modelsRes.data) setNewModels(modelsRes.data.slice(0, 3));
        if (usedRes.success && usedRes.data) setUsedCars(usedRes.data.slice(0, 3));
        if (showroomsRes.success && showroomsRes.data) setShowrooms(showroomsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Editorial Luxury Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden">
        {/* Background Vehicle Image with cinematic lighting */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=90"
            alt="DriveX Flagship Automotive Lucknow"
            className="w-full h-full object-cover object-center opacity-40 scale-105 animate-in fade-in zoom-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lucknow's Authorized Automotive Destination</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-white leading-[1.1]">
              Elevate Your Journey Across <span className="text-blue-500">Lucknow.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Experience the DriveX distinction. Explore our 2026 passenger car lineup with transparent
              city-specific on-road pricing, instant reducing-balance EMI calculators, and guaranteed 5-minute sales response.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/vehicles"
                className="px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <span>Browse New Cars</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/book-test-drive"
                className="px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <CalendarCheck className="w-4 h-4 text-blue-400" />
                <span>Book Showroom Test Drive</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6 text-slate-300">
              <div>
                <span className="font-display font-extrabold text-2xl text-white block">3</span>
                <span className="text-xs text-slate-400">Lucknow Showrooms</span>
              </div>
              <div>
                <span className="font-display font-extrabold text-2xl text-white block">6,900+</span>
                <span className="text-xs text-slate-400">Annual Vehicles Sold</span>
              </div>
              <div>
                <span className="font-display font-extrabold text-2xl text-white block">&lt; 5 Mins</span>
                <span className="text-xs text-slate-400">Response SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured New Cars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Car className="w-4 h-4" />
              <span>Brand New Inventory</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-1">
              Featured 2026 Lineup
            </h2>
          </div>
          <Link
            to="/vehicles"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View All New Models</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newModels.map((model) => (
            <VehicleCard key={model._id} model={model} />
          ))}
        </div>
      </section>

      {/* Value Pillars Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 border border-slate-800 shadow-premium relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block">
              The DriveX Advantage
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
              Automotive Dealership Commerce Reimagined for Lucknow
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No hidden dealer add-ons or phone call delays. We provide authoritative on-road tax calculations, verified demo cars, and certified used vehicles backed by 150-point technical inspections.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-white">Transparent City On-Road Pricing</h5>
                  <p className="text-xs text-slate-400">Complete itemization of road tax, insurance, and FASTag charges.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-white">5-Minute Response Commitment</h5>
                  <p className="text-xs text-slate-400">Deterministic auto-routing to available showroom consultants.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-white">150-Point Certified Used Cars</h5>
                  <p className="text-xs text-slate-400">Inspection certificates with masked registration privacy.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-white">Atomic Test-Drive Reservations</h5>
                  <p className="text-xs text-slate-400">Zero double-booking guarantee with verified demo slots.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Certified Used Cars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Pre-Owned</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-1">
              Verified Used Car Marketplace
            </h2>
          </div>
          <Link
            to="/used-vehicles"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Explore All Certified Pre-Owned</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {usedCars.map((vehicle) => (
            <UsedVehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      {/* Lucknow Showrooms Network Section */}
      <section id="showrooms" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Visit Our Dealership Network
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            3 Flagship Showrooms Across Lucknow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Equipped with dedicated customer lounges, certified technicians, and full demo fleets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showrooms.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-premium p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {s.code}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Open Today
                  </span>
                </div>

                <h4 className="font-display font-bold text-lg text-slate-900">{s.name}</h4>

                <div className="space-y-2 text-xs text-slate-600">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{s.address}, {s.city}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{s.operatingHours}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{s.phone}</span>
                  </p>
                </div>
              </div>

              <Link
                to={`/book-test-drive?showroomId=${s._id}`}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center transition-colors shadow-sm block"
              >
                Book Test Drive at this Showroom
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
