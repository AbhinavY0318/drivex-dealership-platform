import React from 'react';
import { Link } from 'react-router-dom';
import { UsedVehicle } from '../../types/index.js';
import { formatINR, formatKm, maskRegNumber } from '../../utils/format.js';
import { ShieldCheck, Calendar, Gauge, Fuel, CheckCircle, ArrowRight } from 'lucide-react';

interface UsedVehicleCardProps {
  vehicle: UsedVehicle;
}

export const UsedVehicleCard: React.FC<UsedVehicleCardProps> = ({ vehicle }) => {
  const isAvailable = vehicle.status === 'Available';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col">
      {/* Photography & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={vehicle.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'}
          alt={`${vehicle.model} ${vehicle.variant}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-70" />

        {/* Status & Year Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
              isAvailable
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {vehicle.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
            {vehicle.year} Model
          </span>
        </div>

        {/* Masked Registration Badge (DPDP Privacy Compliant) */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700 shadow-sm flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{maskRegNumber(vehicle.registrationNumber)}</span>
          </span>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
            Certified Pre-Owned
          </span>
          <h3 className="font-display font-bold text-xl text-white leading-tight">
            {vehicle.model} <span className="text-slate-300 font-normal">{vehicle.variant}</span>
          </h3>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Inspection Rating Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>150-Point Certified</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-slate-800">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
              ★ {vehicle.inspectionReport?.rating || 4.8} / 5.0
            </span>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-slate-600" />
            <span>{formatKm(vehicle.kilometres)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-slate-600" />
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>{vehicle.transmission}</span>
          </div>
        </div>

        {/* Asking Price & CTA */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold block">
              Certified Asking Price
            </span>
            <span className="font-display font-extrabold text-2xl text-slate-900">
              {formatINR(vehicle.askingPrice)}
            </span>
          </div>

          <Link
            to={`/used-vehicles/${vehicle._id}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-sm group/btn"
          >
            <span>Inspection</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
