import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { VehicleModel, UsedVehicle, Showroom } from '../types/index.js';
import { VehicleCard } from '../components/vehicles/VehicleCard.js';
import { UsedVehicleCard } from '../components/used/UsedVehicleCard.js';
import { formatINR } from '../utils/format.js';
import {
  Car,
  ShieldCheck,
  CalendarCheck,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  Phone,
  CheckCircle,
  MapPin,
  ChevronRight,
  Gauge,
  Fuel,
  Award,
  BadgeCheck,
  ShieldAlert,
  Sliders,
  DollarSign,
  Compass,
} from 'lucide-react';

// Hero model showcase data
const HERO_MODELS = [
  {
    id: 'model-h',
    slug: 'drivex-model-h',
    name: 'DriveX Model H',
    badge: 'Executive Flagship Sedan',
    tagline: 'Refined luxury engineering meets uncompromising performance.',
    price: 1245000,
    power: '121 PS @ 6600 rpm',
    mileage: '18.4 kmpl',
    transmission: 'CVT / 6-Speed MT',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=2000&q=90',
  },
  {
    id: 'model-c',
    slug: 'drivex-model-c',
    name: 'DriveX Model C',
    badge: 'Luxury All-Terrain SUV',
    tagline: 'Dominant road presence engineered for all-weather exploration.',
    price: 1520000,
    power: '156 PS @ 6000 rpm',
    mileage: '16.8 kmpl',
    transmission: '6-Speed AT / MT',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=2000&q=90',
  },
  {
    id: 'model-s',
    slug: 'drivex-model-s',
    name: 'DriveX Model S',
    badge: 'Dynamic Urban Hatchback',
    tagline: 'Agile city cruising with best-in-class cabin ergonomics.',
    price: 640000,
    power: '90 PS @ 6000 rpm',
    mileage: '22.3 kmpl',
    transmission: '5-Speed AMT / MT',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=2000&q=90',
  },
];

export const HomePage: React.FC = () => {
  const [newModels, setNewModels] = useState<VehicleModel[]>([]);
  const [usedCars, setUsedCars] = useState<UsedVehicle[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const navigate = useNavigate();

  const currentHero = HERO_MODELS[activeHeroIndex];

  useEffect(() => {
    Promise.all([
      api.vehicles.getAll({ limit: 3 }),
      api.usedVehicles.getAll({ limit: 3 }),
      api.showrooms.getAll(),
    ])
      .then(([modelsRes, usedRes, showroomsRes]) => {
        if (modelsRes.success && modelsRes.data) setNewModels(modelsRes.data.slice(0, 3));
        if (usedRes.success && usedRes.data) setUsedCars(usedRes.data.slice(0, 3));
        if (showroomsRes.success && showroomsRes.data) setShowrooms(showroomsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* =========================================================================
          1. CINEMATIC LUXURY AUTOMOTIVE HERO WITH INTERACTIVE MODEL SWITCHER
      ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-between bg-slate-950 text-white overflow-hidden pt-12">
        {/* Ambient vehicle background with smooth transition */}
        <div className="absolute inset-0 z-0">
          <img
            key={currentHero.image}
            src={currentHero.image}
            alt={currentHero.name}
            className="w-full h-full object-cover object-center scale-100 animate-in fade-in zoom-in-95 duration-1000 opacity-45 brightness-75"
          />
          {/* Subtle gradient vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Hero Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 w-full flex-1 flex flex-col justify-center">
          <div className="max-w-3xl space-y-7">
            {/* Tagline / Showroom Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-dark text-blue-400 text-xs font-bold tracking-widest uppercase border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Lucknow Premier Automotive Network</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-slate-300 font-normal">3 Showrooms • 2 Workshops</span>
            </div>

            {/* Model Badge & Headline */}
            <div className="space-y-2">
              <span className="text-sm font-bold uppercase tracking-widest text-blue-400 block">
                {currentHero.badge}
              </span>
              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.05]">
                {currentHero.name}
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-base sm:text-lg text-slate-300 font-light max-w-xl leading-relaxed">
              {currentHero.tagline} Discover official Uttar Pradesh on-road prices, personalized reducing-balance EMI plans, and instant VIP test drives.
            </p>

            {/* Live Spec Ticker for Active Hero Model */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 py-4 border-y border-white/10 max-w-lg">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Ex-Showroom</span>
                <span className="font-display font-bold text-xl sm:text-2xl text-white">
                  {formatINR(currentHero.price)}
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Power</span>
                <span className="font-display font-bold text-lg sm:text-xl text-slate-200">
                  {currentHero.power.split('@')[0]}
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Efficiency</span>
                <span className="font-display font-bold text-lg sm:text-xl text-emerald-400">
                  {currentHero.mileage}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to={`/vehicles/${currentHero.slug}`}
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2.5 group"
              >
                <span>Configure & On-Road Price</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to={`/book-test-drive?modelSlug=${currentHero.slug}`}
                className="px-8 py-4 rounded-xl glass-dark hover:bg-slate-800 text-white border border-slate-700 font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2.5"
              >
                <CalendarCheck className="w-4 h-4 text-blue-400" />
                <span>Book VIP Test Drive</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Model Quick Selector Navigation Bar (Bottom of Hero) */}
        <div className="relative z-10 w-full border-t border-white/10 glass-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                Featured 2026 Passenger Lineup:
              </span>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {HERO_MODELS.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveHeroIndex(idx)}
                    className={`px-3 sm:px-5 py-2 rounded-lg text-left transition-all ${
                      activeHeroIndex === idx
                        ? 'bg-blue-600/30 border border-blue-400 text-white shadow-sm'
                        : 'bg-white/5 border border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold truncate">{m.name}</span>
                    <span className="text-[10px] text-slate-300 block font-mono">From {formatINR(m.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. THE DRIVEX ADVANTAGE: 4 ENTERPRISE PILLARS
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Authorized Dealership Standard</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Engineered For Absolute Transparency
          </h2>
          <p className="text-sm text-slate-600">
            Serving Lucknow car buyers with authoritative city taxation, instant loan modeling, and verified sales response times.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-premium transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">Authoritative On-Road Pricing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official Lucknow, Kanpur, Ayodhya, and Varanasi RTO tax rates, insurance, and accessory breakdowns. No guesswork or hidden dealer charges.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-premium transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">5-Minute Sales Response SLA</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every digital enquiry is deterministically routed to a dedicated sales consultant at your preferred showroom with active SLA countdown monitoring.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-premium transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">Atomic Test-Drive Scheduling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time demo vehicle availability tracking across all 3 Lucknow showrooms with atomic concurrency locking to eliminate double bookings.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-premium transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">150-Point Certified Used Yard</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every pre-owned car undergoes rigorous diagnostic testing with full mechanical certificates and privacy-sanitized registration numbers (UP32**1234).
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURED NEW VEHICLES
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Car className="w-4 h-4" />
              <span>DriveX 2026 Fleet</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-1">
              New Passenger Vehicles
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select your preferred model to calculate exact Uttar Pradesh on-road prices or schedule an immediate test drive.
            </p>
          </div>

          <Link
            to="/vehicles"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
          >
            <span>View Complete Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newModels.map((m) => (
            <VehicleCard key={m._id} model={m} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. PROMOTIONAL FESTIVAL & CORPORATE OFFERS
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-premium">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Exclusive Lucknow Dealership Benefits
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl tracking-tight text-white">
              Drive Home With Tailored Automotive Financing
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Take advantage of festive corporate discounts up to ₹50,000, 3-year complimentary zero-depreciation insurance packages, and competitive reducing-balance loan interest rates starting at 8.25% p.a.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Pre-approved HDFC & SBI Bank Financing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Same-Day Trade-In Evaluation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Complimentary 5-Year Roadside Assistance
              </span>
            </div>

            <div className="pt-4">
              <Link
                to="/enquiry"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>Request Custom Dealer Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CERTIFIED PRE-OWNED MARKETPLACE (DPDP COMPLIANT)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Pre-Owned Yard</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-1">
              Quality-Inspected Used Cars
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              150-point diagnostic certified, verified ownership history, and DPDP-compliant masked registration numbers.
            </p>
          </div>

          <Link
            to="/used-vehicles"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
          >
            <span>Explore All Certified Pre-Owned</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Used Car Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {usedCars.map((uc) => (
            <UsedVehicleCard key={uc._id} vehicle={uc} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. LUCKNOW SHOWROOM NETWORK & SERVICE HUBS
      ========================================================================= */}
      <section id="showrooms" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Building2 className="w-4 h-4" />
            <span>Showroom Network</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Visit Our Lucknow Facilities
          </h2>
          <p className="text-xs text-slate-600">
            Strategically located across Lucknow's retail and commercial corridors to deliver seamless showroom consultations, test-drive dispatch, and after-sales service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showrooms.map((sh) => (
            <div
              key={sh._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-premium transition-all flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {sh.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">{sh.name}</h3>
                  <p className="text-xs text-slate-600 flex items-start gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{sh.address}, {sh.city}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sh.operatingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sh.phone}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <Link
                  to={`/book-test-drive?showroomId=${sh._id}`}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-transparent text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Book Test Drive Here</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
