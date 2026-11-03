import React from 'react';
import { Link } from 'react-router-dom';
import { VehicleModel } from '../../types/index.js';
import { formatINR, formatLakh } from '../../utils/format.js';
import { Gauge, Fuel, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface VehicleCardProps {
  model: VehicleModel;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ model }) => {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col">
      {/* Vehicle Photography */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={model.heroImage}
          alt={model.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

        {/* Category & Badge Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-950/80 backdrop-blur-md text-white border border-white/10 shadow-sm">
            {model.category}
          </span>
          {model.isFeatured && (
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-600 text-white shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
        </div>

        {/* Model Name & Tagline Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">{model.brand}</p>
          <h3 className="font-display font-extrabold text-2xl tracking-tight text-white leading-tight">
            {model.name}
          </h3>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Tagline */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {model.tagline}
        </p>

        {/* Specification Chips */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-slate-600">
          <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-slate-50">
            <Gauge className="w-4 h-4 text-blue-600 mb-1" />
            <span className="text-[10px] text-slate-600 font-medium uppercase">Power</span>
            <span className="text-xs font-bold text-slate-800">{model.specSummary.power.split('@')[0]}</span>
          </div>

          <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-slate-50">
            <Fuel className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-[10px] text-slate-600 font-medium uppercase">Mileage</span>
            <span className="text-xs font-bold text-slate-800">{model.specSummary.mileage}</span>
          </div>

          <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-slate-50">
            <ShieldCheck className="w-4 h-4 text-indigo-600 mb-1" />
            <span className="text-[10px] text-slate-600 font-medium uppercase">Warranty</span>
            <span className="text-xs font-bold text-slate-800">3 Yrs / 1L km</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold block">
              Starts Ex-Showroom
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-xl text-slate-900">
                {formatINR(model.startingPrice)}
              </span>
              <span className="text-xs text-slate-600 font-medium">({formatLakh(model.startingPrice)})</span>
            </div>
          </div>

          <Link
            to={`/vehicles/${model.slug}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm group/btn"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
