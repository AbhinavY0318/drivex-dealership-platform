import React from 'react';
import { Link } from 'react-router-dom';
import { UsedVehicle } from '../../types/index.js';
import { formatINR, formatKm, maskRegNumber } from '../../utils/format.js';
import { ShieldCheck, Calendar, Gauge, Fuel, CheckCircle, ArrowRight, UserCheck, Award } from 'lucide-react';

interface UsedVehicleCardProps {
  vehicle: UsedVehicle;
}

export const UsedVehicleCard: React.FC<UsedVehicleCardProps> = ({ vehicle }) => {
  const isAvailable = vehicle.status === 'Available';

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-premium-hover hover:border-slate-300 transition-all duration-500 flex flex-col justify-between">
      <div>
        {/* Photography & Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
          <img
            src={vehicle.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'}
            alt={`${vehicle.model} ${vehicle.variant}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-95 group-hover:brightness-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-sm ${
                isAvailable ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              {vehicle.status}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider glass-dark text-white border border-white/10">
              {vehicle.year} Model
            </span>
          </div>

          {/* Masked Registration Badge (DPDP Act Compliant) */}
          <div className="absolute top-3.5 right-3.5">
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold glass-dark text-slate-200 border border-white/20 shadow-sm flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{maskRegNumber(vehicle.registrationNumber)}</span>
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-3.5 left-4 right-4 text-white">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold block">
              DriveX Certified Pre-Owned
            </span>
            <h3 className="font-display font-bold text-xl text-white leading-tight">
              {vehicle.model} <span className="text-slate-300 font-normal">{vehicle.variant}</span>
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Inspection Score Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>150-Point Certified Yard</span>
            </div>
            <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
              ★ {vehicle.inspectionReport?.rating || 4.8} / 5.0
            </span>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600 text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase text-slate-600 block font-semibold">Odometer</span>
              <strong className="text-slate-900 block">{formatKm(vehicle.kilometres)}</strong>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase text-slate-600 block font-semibold">Fuel</span>
              <strong className="text-slate-900 block">{vehicle.fuelType}</strong>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase text-slate-600 block font-semibold">Gearbox</span>
              <strong className="text-slate-900 block">{vehicle.transmission}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Asking Price & CTA */}
      <div className="p-6 pt-0 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold block">
              Certified Asking Price
            </span>
            <span className="font-display font-black text-2xl text-slate-900">
              {formatINR(vehicle.askingPrice)}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-600">
            Lucknow Yard Stock
          </span>
        </div>

        <Link
          to={`/used-vehicles/${vehicle._id}`}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 group/btn shadow-sm"
        >
          <span>View 150-Pt Inspection</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
