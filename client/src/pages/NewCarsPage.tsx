import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { VehicleModel } from '../types/index.js';
import { VehicleCard } from '../components/vehicles/VehicleCard.js';
import { Search, Filter, Car, Loader2 } from 'lucide-react';

export const NewCarsPage: React.FC = () => {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>('ALL');
  const [fuel, setFuel] = useState<string>('ALL');
  const [transmission, setTransmission] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const fetchModels = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (category !== 'ALL') params.category = category;
      if (fuel !== 'ALL') params.fuel = fuel;
      if (transmission !== 'ALL') params.transmission = transmission;
      if (search) params.search = search;

      const res = await api.vehicles.getAll(params);
      if (res.success && res.data) {
        setModels(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [category, fuel, transmission]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchModels();
  };

  const categories = ['ALL', 'SUV', 'Sedan', 'Electric'];
  const fuels = ['ALL', 'Petrol', 'Diesel', 'Electric'];
  const transmissions = ['ALL', 'Automatic', 'Manual'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <Car className="w-4 h-4" />
          <span>New Vehicle Showroom</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Explore DriveX 2026 Fleet
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Discover cutting-edge passenger models with transparent Lucknow on-road prices, zero hidden fees, and standard factory warranties.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vehicle model name or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Body Type:</span>
            <div className="flex gap-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    category === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Fuel:</span>
            <div className="flex gap-1">
              {fuels.map((f) => (
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

          {/* Transmission */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Transmission:</span>
            <div className="flex gap-1">
              {transmissions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTransmission(t)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    transmission === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Models */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs">Loading authorized vehicle inventory...</p>
        </div>
      ) : models.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg">No vehicles found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your category or fuel filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model) => (
            <VehicleCard key={model._id} model={model} />
          ))}
        </div>
      )}
    </div>
  );
};
