import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { VehicleModel, VehicleVariant, CityPricingResult } from '../types/index.js';
import { PriceBreakupModal } from '../components/vehicles/PriceBreakupModal.js';
import { EMICalculatorWidget } from '../components/vehicles/EMICalculatorWidget.js';
import { formatINR, formatLakh } from '../utils/format.js';
import {
  Car,
  Fuel,
  Gauge,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Calculator,
  ArrowRight,
  Sparkles,
  MapPin,
  ChevronRight,
  Layers,
  Zap,
  Info,
  Check,
  Clock,
  Phone,
  Tag,
  Award,
} from 'lucide-react';

const CITIES = ['Lucknow', 'Kanpur', 'Ayodhya', 'Varanasi'];

export const NewCarDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [model, setModel] = useState<VehicleModel | null>(null);
  const [variants, setVariants] = useState<VehicleVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<VehicleVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Lucknow');
  const [cityPricing, setCityPricing] = useState<CityPricingResult | null>(null);
  const [pricingLoading, setPricingLoading] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [activeSpecTab, setActiveSpecTab] = useState<'engine' | 'dimensions' | 'safety' | 'features'>('engine');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.vehicles
      .getBySlug(slug)
      .then((res) => {
        if (res.success && res.data) {
          setModel(res.data.model);
          setVariants(res.data.variants);
          if (res.data.variants.length > 0) {
            const firstVariant = res.data.variants[0];
            setSelectedVariant(firstVariant);
            if (firstVariant.colors && firstVariant.colors.length > 0) {
              setSelectedColor(firstVariant.colors[0]);
            }
          }
          setActiveImage(res.data.model.heroImage);
        }
      })
      .catch((err) => setError(err.message || 'Vehicle not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Fetch On-Road Price when variant or city changes
  useEffect(() => {
    if (selectedVariant) {
      setPricingLoading(true);
      api.vehicles
        .getPricing(selectedVariant._id, selectedCity)
        .then((res) => {
          if (res.success && res.data) {
            setCityPricing(res.data);
          }
        })
        .finally(() => setPricingLoading(false));
    }
  }, [selectedVariant, selectedCity]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center animate-bounce">
          <Car className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Loading vehicle specifications & regional pricing...
        </p>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Vehicle Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'The requested model could not be found.'}</p>
        <Link to="/vehicles" className="inline-block px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
          Back to Showroom Inventory
        </Link>
      </div>
    );
  }

  const handleVariantSelect = (v: VehicleVariant) => {
    setSelectedVariant(v);
    if (v.colors && v.colors.length > 0) {
      setSelectedColor(v.colors[0]);
    }
  };

  const handleProceedEnquiryWithPricing = (snapshot?: CityPricingResult) => {
    navigate('/enquiry', {
      state: {
        preferredModelId: model._id,
        preferredVariantId: selectedVariant?._id,
        pricingSnapshot: snapshot || cityPricing,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/vehicles" className="hover:text-blue-600">New Cars</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">{model.name}</span>
      </nav>

      {/* =========================================================================
          HERO GALLERY & TRIM SELECTION SECTION
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Interactive Visual Showcase (Gallery + Color Swatches) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Large Vehicle Image Container */}
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-950 shadow-premium border border-slate-200">
            <img
              src={activeImage || model.heroImage}
              alt={model.name}
              className="w-full h-full object-cover transition-all duration-700 ease-out"
            />
            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-75" />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase glass-dark text-white border border-white/10 shadow-sm">
                {model.category}
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock (Lucknow)
              </span>
            </div>

            {/* Selected Color Overlay */}
            {selectedColor && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                <div className="glass-dark px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: selectedColor.hexCode }}
                  />
                  <span className="font-semibold text-slate-200">{selectedColor.name}</span>
                </div>
                <span className="text-[11px] text-slate-300 font-mono">3 Showrooms Lucknow</span>
              </div>
            )}
          </div>

          {/* Color Swatch Picker */}
          {selectedVariant && selectedVariant.colors && selectedVariant.colors.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Available Shades:</span>
              </div>

              <div className="flex items-center gap-2.5">
                {selectedVariant.colors.map((color: any, idx: number) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white font-bold ring-2 ring-blue-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-sm"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-4 gap-3 bg-white p-5 rounded-2xl border border-slate-200 text-center">
            <div className="space-y-1">
              <Gauge className="w-4 h-4 text-blue-600 mx-auto" />
              <span className="text-[10px] text-slate-600 font-semibold uppercase block">Engine</span>
              <strong className="text-xs text-slate-900 block">{selectedVariant?.engineCapacityCc || 1498} cc</strong>
            </div>

            <div className="space-y-1">
              <Zap className="w-4 h-4 text-amber-500 mx-auto" />
              <span className="text-[10px] text-slate-600 font-semibold uppercase block">Power</span>
              <strong className="text-xs text-slate-900 block">{selectedVariant?.powerBhp ? `${selectedVariant.powerBhp} PS` : '121 PS'}</strong>
            </div>

            <div className="space-y-1">
              <Fuel className="w-4 h-4 text-emerald-600 mx-auto" />
              <span className="text-[10px] text-slate-600 font-semibold uppercase block">Mileage</span>
              <strong className="text-xs text-slate-900 block">{selectedVariant?.mileageKmpl || 18.4} kmpl</strong>
            </div>

            <div className="space-y-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600 mx-auto" />
              <span className="text-[10px] text-slate-600 font-semibold uppercase block">NCAP Rating</span>
              <strong className="text-xs text-slate-900 block">{selectedVariant?.safetyRating || '5 Star'}</strong>
            </div>
          </div>
        </div>

        {/* Right: Trims, Pricing Snapshot & CTAs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Title & Tagline */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block">
              {model.brand} Premier Collection
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
              {model.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {model.description || model.tagline}
            </p>
          </div>

          {/* Variant Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Select Trim / Variant:</span>
              <span className="text-slate-600">{variants.length} available</span>
            </div>

            <div className="space-y-2">
              {variants.map((v) => {
                const isSelected = selectedVariant?._id === v._id;
                return (
                  <button
                    key={v._id}
                    onClick={() => handleVariantSelect(v)}
                    className={`w-full p-4 rounded-2xl text-left transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{v.name}</strong>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {v.fuelType} • {v.transmission}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {v.variantCode} • {v.engineCapacityCc}cc • {v.mileageKmpl} km/l
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-600 uppercase font-semibold block">Ex-Showroom</span>
                      <strong className="font-display font-bold text-base text-slate-900">
                        {formatINR(v.exShowroomPrice)}
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regional On-Road Price Preview Card */}
          <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-premium space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Estimated On-Road Price ({selectedCity}):
              </span>

              {/* City Quick Switcher */}
              <div className="flex gap-1">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCity(c)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                      selectedCity === c ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-baseline justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-display font-black text-3xl text-white">
                  {cityPricing ? formatINR(cityPricing.totalOnRoadPrice) : 'Calculating...'}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  {cityPricing && `(${formatLakh(cityPricing.totalOnRoadPrice)})`}
                </span>
              </div>

              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 underline uppercase tracking-wider"
              >
                Full Breakup
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                UP RTO Road Tax (8%)
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Zero-Dep Insurance
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Essential Accessories Pack
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                FASTag & Registration Cess
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to={`/book-test-drive?modelSlug=${model.slug}&variantId=${selectedVariant?._id}`}
                className="py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider text-center transition-all shadow-glow flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Book Test Drive</span>
              </Link>

              <button
                onClick={() => handleProceedEnquiryWithPricing()}
                className="py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Request Quotation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          REDUCING-BALANCE EMI CALCULATOR INTEGRATION
      ========================================================================= */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            Personalize Your Financing Plan
          </h2>
          <p className="text-xs text-slate-600">
            Calculate exact monthly installments for the {selectedVariant?.name || model.name} using the official reducing-balance loan formula.
          </p>
        </div>

        <EMICalculatorWidget initialPrice={cityPricing?.totalOnRoadPrice || selectedVariant?.exShowroomPrice || 1400000} />
      </section>

      {/* =========================================================================
          TABBED TECHNICAL SPECIFICATIONS TABLE
      ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">
              Technical Specifications & Features
            </h2>
            <p className="text-xs text-slate-600">
              Detailed engineering parameters for {model.name} {selectedVariant?.name}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'engine', label: 'Engine & Performance' },
              { id: 'dimensions', label: 'Dimensions & Capacity' },
              { id: 'safety', label: 'Safety & Security' },
              { id: 'features', label: 'Comfort & Luxury' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSpecTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeSpecTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {activeSpecTab === 'engine' && (
            <>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Engine Displacement</span>
                <strong className="text-slate-900 font-bold">{selectedVariant?.engineCapacityCc || 1498} cc</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Max Power</span>
                <strong className="text-slate-900 font-bold">{selectedVariant?.powerBhp ? `${selectedVariant.powerBhp} PS @ 6600 rpm` : '121 PS @ 6600 rpm'}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Max Torque</span>
                <strong className="text-slate-900 font-bold">{selectedVariant?.torqueNm ? `${selectedVariant.torqueNm} Nm @ 4300 rpm` : '145 Nm @ 4300 rpm'}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Fuel Efficiency (ARAI)</span>
                <strong className="text-slate-900 font-bold">{selectedVariant?.mileageKmpl || 18.4} km/l</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Transmission</span>
                <strong className="text-slate-900 font-bold">{selectedVariant?.transmission}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Emission Standard</span>
                <strong className="text-slate-900 font-bold">BS6 Phase 2 (RDE Compliant)</strong>
              </div>
            </>
          )}

          {activeSpecTab === 'dimensions' && (
            <>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Seating Capacity</span>
                <strong className="text-slate-900 font-bold">{selectedVariant?.seatingCapacity || 5} Persons</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Boot Space</span>
                <strong className="text-slate-900 font-bold">506 Litres</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Fuel Tank Capacity</span>
                <strong className="text-slate-900 font-bold">40 Litres</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Ground Clearance</span>
                <strong className="text-slate-900 font-bold">165 mm (Unladen)</strong>
              </div>
            </>
          )}

          {activeSpecTab === 'safety' && (
            <>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Airbags</span>
                <strong className="text-slate-900 font-bold">6 Airbags (Front, Side & Curtain)</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Braking Control</span>
                <strong className="text-slate-900 font-bold">ABS with EBD & Brake Assist</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Global NCAP Rating</span>
                <strong className="text-emerald-700 font-bold">{selectedVariant?.safetyRating || '5 Star Certified'}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Stability Assist</span>
                <strong className="text-slate-900 font-bold">Electronic Stability Program (ESP)</strong>
              </div>
            </>
          )}

          {activeSpecTab === 'features' && (
            <>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Infotainment Display</span>
                <strong className="text-slate-900 font-bold">10.25-inch HD Touchscreen</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Smartphone Connectivity</span>
                <strong className="text-slate-900 font-bold">Wireless Apple CarPlay & Android Auto</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Sunroof</span>
                <strong className="text-slate-900 font-bold">One-Touch Electric Sunroof</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Climate Control</span>
                <strong className="text-slate-900 font-bold">Automatic Climate with PM2.5 Filter</strong>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Price Breakup Modal (if triggered) */}
      {selectedVariant && (
        <PriceBreakupModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          variantId={selectedVariant._id}
          variantName={selectedVariant.name}
          modelName={model.name}
          onProceedEnquiry={(snapshot) => {
            setIsPricingModalOpen(false);
            handleProceedEnquiryWithPricing(snapshot);
          }}
          onProceedTestDrive={() => {
            setIsPricingModalOpen(false);
            navigate(`/book-test-drive?modelSlug=${model.slug}&variantId=${selectedVariant._id}`);
          }}
        />
      )}
    </div>
  );
};
