import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { UsedVehicle } from '../types/index.js';
import { UsedVehicleCard } from '../components/used/UsedVehicleCard.js';
import { Search, ShieldCheck, Filter, Loader2, CheckCircle2 } from 'lucide-react';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Certified Used Vehicle Marketplace</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          DriveX Certified Pre-Owned Fleet
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Every vehicle is backed by a 150-point technical inspection certificate, clear title verification,
          and transparent vehicle privacy masking compliant with Indian DPDP standards.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model name or Stock ID (e.g. UC-1182)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Fuel Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Fuel:</span>
            <div className="flex gap-1">
              {['ALL', 'Petrol', 'Diesel'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFuel(f)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    fuel === f ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Availability:</span>
            <div className="flex gap-1">
              {['ALL', 'Available', 'Booked'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    status === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Used Vehicles */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs">Loading certified pre-owned stock...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg">No certified cars found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((v) => (
            <UsedVehicleCard key={v._id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  );
};
