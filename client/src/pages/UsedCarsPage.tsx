import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { UsedVehicle } from '../types/index.js';
import { UsedVehicleCard } from '../components/used/UsedVehicleCard.js';
import { Search, ShieldCheck, Filter, RotateCcw, CheckCircle2, Lock, Award, Car } from 'lucide-react';

export const UsedCarsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<UsedVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fuel, setFuel] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const fetchUsedVehicles = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (fuel !== 'ALL') params.fuel = fuel;
      if (status !== 'ALL') params.status = status;
      if (search) params.search = search;

      const res = await api.usedVehicles.getAll(params);
      if (res.success && res.data) {
        setVehicles(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsedVehicles();
  }, [fuel, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsedVehicles();
  };

  const handleResetFilters = () => {
    setFuel('ALL');
    setStatus('ALL');
    setSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Editorial Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Lucknow Certified Used-Car Yard</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
          Certified Pre-Owned Inventory
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Every vehicle is backed by a 150-point diagnostic inspection certificate, clear title verification, non-accidental guarantee, and transparent vehicle privacy masking compliant with Indian DPDP standards.
        </p>
      </div>

      {/* DPDP Act 2023 Privacy Notice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              DPDP Act 2023 Privacy Compliance
            </h2>
            <p className="text-[11px] text-slate-400">
              Vehicle registration marks are strictly masked as <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded">UP32**1234</code> to prevent unauthorized personal data linkage.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-slate-300 whitespace-nowrap">
          Official Yard Registry
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model, variant, or stock ID (e.g. Model C, UC-1182)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
          />
        </form>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Fuel Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Fuel Type:</span>
            <div className="flex gap-1.5">
              {['ALL', 'Petrol', 'Diesel'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFuel(f)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    fuel === f
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Availability:</span>
            <div className="flex gap-1.5">
              {['ALL', 'Available', 'Booked'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    status === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content or Skeleton or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-200 overflow-hidden p-6 space-y-4 animate-pulse">
              <div className="aspect-[16/10] bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((v) => (
            <UsedVehicleCard key={v._id} vehicle={v} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900">No Used Cars Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No pre-owned vehicles match your active criteria in our Lucknow certified yard.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
