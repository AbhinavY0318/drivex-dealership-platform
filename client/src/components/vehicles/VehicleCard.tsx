import React from 'react';
import { Link } from 'react-router-dom';
import { VehicleModel } from '../../types/index.js';
import { formatINR, formatLakh } from '../../utils/format.js';
import { Gauge, Fuel, Zap, ArrowRight, ShieldCheck, CalendarCheck, Sparkles } from 'lucide-react';

interface VehicleCardProps {
  model: VehicleModel;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ model }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-premium-hover hover:border-slate-300 transition-all duration-500 flex flex-col justify-between">
      {/* Vehicle Image Container */}
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
          <img
            src={model.heroImage}
            alt={model.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-95 group-hover:brightness-100"
            loading="lazy"
          />
          {/* Subtle lighting gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

          {/* Top Category Badge */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase glass-dark text-white border border-white/10 shadow-sm">
              {model.category}
            </span>
            {model.isFeatured && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-600 text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
          </div>

          {/* Model Name & Brand Overlay */}
          <div className="absolute bottom-3.5 left-4 right-4 text-white">
            <p className="text-[11px] uppercase tracking-widest text-blue-400 font-semibold">{model.brand}</p>
            <h3 className="font-display font-extrabold text-2xl tracking-tight text-white leading-tight">
              {model.name}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Tagline */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[36px]">
            {model.tagline}
          </p>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-3 gap-2.5 py-3.5 border-y border-slate-100 text-slate-600">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-100/80">
              <Gauge className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">Power</span>
              <span className="text-xs font-bold text-slate-900">{model.specSummary.power.split('@')[0]}</span>
            </div>

            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-100/80">
              <Fuel className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">Efficiency</span>
              <span className="text-xs font-bold text-slate-900">{model.specSummary.mileage}</span>
            </div>

            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-100/80">
              <ShieldCheck className="w-4 h-4 text-indigo-600 mb-1" />
              <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">Safety</span>
              <span className="text-xs font-bold text-slate-900">5 Star (NCAP)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Call to Actions */}
      <div className="p-6 pt-0 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold block">
              Starts Ex-Showroom
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl text-slate-900">
                {formatINR(model.startingPrice)}
              </span>
              <span className="text-xs text-slate-600 font-medium">({formatLakh(model.startingPrice)})</span>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            In Stock (Lucknow)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to={`/vehicles/${model.slug}`}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm group/btn"
          >
            <span>On-Road Price</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to={`/book-test-drive?modelSlug=${model.slug}`}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider transition-colors border border-blue-200"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Test Drive</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
