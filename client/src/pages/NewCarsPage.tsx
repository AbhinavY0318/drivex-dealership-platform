import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { VehicleModel } from '../types/index.js';
import { VehicleCard } from '../components/vehicles/VehicleCard.js';
import { Search, Filter, Car, RotateCcw, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const NewCarsPage: React.FC = () => {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>('ALL');
  const [fuel, setFuel] = useState<string>('ALL');
  const [transmission, setTransmission] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

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
        let sorted = [...res.data];
        if (sortBy === 'price-low') {
          sorted.sort((a, b) => a.startingPrice - b.startingPrice);
        } else if (sortBy === 'price-high') {
          sorted.sort((a, b) => b.startingPrice - a.startingPrice);
        }
        setModels(sorted);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [category, fuel, transmission, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchModels();
  };

  const handleResetFilters = () => {
    setCategory('ALL');
    setFuel('ALL');
    setTransmission('ALL');
    setSearch('');
    setSortBy('featured');
  };

  const categories = ['ALL', 'Sedan', 'SUV', 'Hatchback', 'Electric'];
  const fuels = ['ALL', 'Petrol', 'Diesel', 'Electric'];
  const transmissions = ['ALL', 'Automatic', 'Manual'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Editorial Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Car className="w-3.5 h-3.5" />
          <span>Lucknow Authorized Showrooms</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
          New Passenger Vehicles
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Explore our certified 2026 fleet. Select any vehicle to view official city-specific on-road prices for Lucknow, Kanpur, Ayodhya, and Varanasi, customize reducing-balance EMI plans, and book showroom test drives.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        {/* Top: Search and Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by model name or keyword (e.g. Model H, Sedan, Diesel)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
            />
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort vehicles by"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="featured">Featured Order</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter Pills Grid */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Body Type:</span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    category === c
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Fuel:</span>
            <div className="flex flex-wrap gap-1.5">
              {fuels.map((f) => (
                <button
                  key={f}
                  onClick={() => setFuel(f)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    fuel === f
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Transmission Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Transmission:</span>
            <div className="flex flex-wrap gap-1.5">
              {transmissions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTransmission(t)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    transmission === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
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
              <div className="h-12 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model) => (
            <VehicleCard key={model._id} model={model} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900">No Vehicles Match Your Filter Criteria</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try adjusting your body type, fuel type, or search keyword to view available showroom stock.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
