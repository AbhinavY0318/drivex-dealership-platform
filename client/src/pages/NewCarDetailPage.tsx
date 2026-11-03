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
} from 'lucide-react';

export const NewCarDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [model, setModel] = useState<VehicleModel | null>(null);
  const [variants, setVariants] = useState<VehicleVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<VehicleVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
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
            setSelectedVariant(res.data.variants[0]);
            if (res.data.variants[0].colors?.length > 0) {
              setSelectedColor(res.data.variants[0].colors[0]);
            }
          }
          setActiveImage(res.data.model.heroImage);
        }
      })
      .catch((err) => setError(err.message || 'Vehicle not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Car className="w-10 h-10 animate-bounce text-blue-600" />
        <p className="text-xs font-semibold">Loading vehicle specifications & pricing...</p>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Vehicle Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'The requested model could not be found.'}</p>
        <Link to="/vehicles" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold">
          Back to Inventory
        </Link>
      </div>
    );
  }

  const handleVariantSelect = (v: VehicleVariant) => {
    setSelectedVariant(v);
    if (v.colors?.length > 0) {
      setSelectedColor(v.colors[0]);
    }
  };

  const handleProceedEnquiryWithPricing = (snapshot: CityPricingResult) => {
    navigate('/enquiry', {
      state: {
        preferredModelId: model._id,
        preferredVariantId: selectedVariant?._id,
        pricingSnapshot: snapshot,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/vehicles" className="hover:text-blue-600">New Cars</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">{model.name}</span>
      </nav>

      {/* Hero Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (Large view + thumbnail switcher) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-900 shadow-premium border border-slate-200">
            <img
              src={activeImage || model.heroImage}
              alt={model.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
                {model.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-600 text-white">
                2026 Model
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {model.galleryImages && model.galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {model.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details, Variant Selector, Pricing CTAs */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
              {model.brand} Authorized Lineup
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
              {model.name}
            </h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{model.tagline}</p>
          </div>

          {/* Variant Selector Tabs */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Select Vehicle Variant:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {variants.map((v) => (
                <button
                  key={v._id}
                  onClick={() => handleVariantSelect(v)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedVariant?._id === v._id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{v.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {v.stockId}
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 font-bold block mt-1">
                    {formatINR(v.exShowroomPrice)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {v.fuelType} • {v.transmission}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker (if variant has colors) */}
          {selectedVariant && selectedVariant.colors?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Exterior Color:</span>
                <span className="font-semibold text-slate-900">{selectedColor?.name || 'Selected Color'}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedVariant.colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedColor?.name === c.name ? 'scale-110 border-blue-600 shadow-md ring-2 ring-blue-300' : 'border-white shadow-sm'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* On-Road Pricing Engine Highlight Card */}
          <div className="p-5 rounded-2xl bg-slate-950 text-white space-y-4 shadow-premium">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Ex-Showroom Price
                </span>
                <span className="font-display font-extrabold text-2xl text-white">
                  {formatINR(selectedVariant?.exShowroomPrice || model.startingPrice)}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40">
                Lucknow RTO Tariffs
              </span>
            </div>

            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Calculate City On-Road Price & Breakup</span>
            </button>
          </div>

          {/* Booking & Enquiry Direct CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              to={`/book-test-drive?modelId=${model._id}&variantId=${selectedVariant?._id}`}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs text-center transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <CalendarCheck className="w-4 h-4 text-blue-400" />
              <span>Book Test Drive</span>
            </Link>

            <Link
              to={`/enquiry?modelId=${model._id}&variantId=${selectedVariant?._id}`}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs text-center border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Technical Specifications Sheet */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-premium space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-slate-900 tracking-tight">
              Technical Specifications & Engineering
            </h3>
            <p className="text-xs text-slate-500">Full manufacturer performance and capacity ratings</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Engine</span>
            <span className="font-bold text-slate-900 block">{model.specSummary.engine}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Max Power</span>
            <span className="font-bold text-slate-900 block">{model.specSummary.power}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Transmission</span>
            <span className="font-bold text-slate-900 block">{model.specSummary.transmission}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Certified Mileage</span>
            <span className="font-bold text-slate-900 block">{model.specSummary.mileage}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Boot Capacity</span>
            <span className="font-bold text-slate-900 block">{model.specSummary.bootSpace}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Ground Clearance</span>
            <span className="font-bold text-slate-900 block">{model.specSummary.groundClearance}</span>
          </div>
        </div>

        {/* Features Checklist */}
        {selectedVariant && selectedVariant.features?.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-display font-bold text-sm text-slate-800">
              Key Features & Inclusions ({selectedVariant.name})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {selectedVariant.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Embedded Reducing Balance EMI Calculator Widget */}
      <section className="space-y-4">
        <EMICalculatorWidget initialPrice={selectedVariant?.exShowroomPrice ? selectedVariant.exShowroomPrice * 1.14 : 1400000} />
      </section>

      {/* City-Specific On-Road Price Breakup Modal */}
      {selectedVariant && (
        <PriceBreakupModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          variantId={selectedVariant._id}
          variantName={selectedVariant.name}
          modelName={model.name}
          onProceedEnquiry={handleProceedEnquiryWithPricing}
          onProceedTestDrive={() =>
            navigate(`/book-test-drive?modelId=${model._id}&variantId=${selectedVariant._id}`)
          }
        />
      )}
    </div>
  );
};
