import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { CityPricingResult } from '../../types/index.js';
import { formatINR } from '../../utils/format.js';
import { X, MapPin, Calendar, AlertTriangle, ShieldCheck, Tag, Check, Loader2 } from 'lucide-react';

interface PriceBreakupModalProps {
  isOpen: boolean;
  onClose: () => void;
  variantId: string;
  variantName: string;
  modelName: string;
  onProceedEnquiry?: (pricingSnapshot: CityPricingResult) => void;
  onProceedTestDrive?: () => void;
}

const SUPPORTED_CITIES = ['Lucknow', 'Kanpur', 'Ayodhya', 'Varanasi'];

export const PriceBreakupModal: React.FC<PriceBreakupModalProps> = ({
  isOpen,
  onClose,
  variantId,
  variantName,
  modelName,
  onProceedEnquiry,
  onProceedTestDrive,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('Lucknow');
  const [pricing, setPricing] = useState<CityPricingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.vehicles.getPricing(variantId, city);
      if (res.success && res.data) {
        setPricing(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch on-road pricing breakup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && variantId) {
      fetchPricing(selectedCity);
    }
  }, [isOpen, variantId, selectedCity]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>DriveX Authoritative On-Road Pricing Engine</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl tracking-tight text-white mt-1">
              {modelName} – {variantName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Itemized road registration, tax, insurance, and statutory breakdown
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Selector Tabs */}
        <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Select Regional RTO City:</span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto py-1">
            {SUPPORTED_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCity === city
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body / Breakup Table */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Calculating regional taxes & dealer tariffs...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          ) : pricing ? (
            <>
              {/* Validity Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>
                    Valid in <strong>{pricing.city}, {pricing.state}</strong> until:{' '}
                    <strong>{pricing.priceValidityDate}</strong>
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 text-blue-900">
                  Active Tariff
                </span>
              </div>

              {/* Breakup List */}
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden text-sm">
                <div className="flex items-center justify-between p-3.5 bg-slate-50/50">
                  <div>
                    <span className="font-semibold text-slate-800">Ex-Showroom Price</span>
                    <p className="text-[11px] text-slate-600">Base manufacturer vehicle cost</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(pricing.breakup.exShowroomPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5">
                  <div>
                    <span className="font-semibold text-slate-800">RTO Road Tax & Registration</span>
                    <p className="text-[11px] text-slate-600">Uttar Pradesh state road development cess</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(pricing.breakup.rtoRoadTax)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5">
                  <div>
                    <span className="font-semibold text-slate-800">Comprehensive Insurance</span>
                    <p className="text-[11px] text-slate-600">1-Year Own Damage + 3-Year Mandatory Third Party</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(pricing.breakup.insurance)}
                  </span>
                </div>

                {pricing.breakup.tcsAmount > 0 && (
                  <div className="flex items-center justify-between p-3.5">
                    <div>
                      <span className="font-semibold text-slate-800">TCS (1% statutory tax)</span>
                      <p className="text-[11px] text-slate-600">Applicable for invoices exceeding ₹10,00,000</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {formatINR(pricing.breakup.tcsAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3.5">
                  <div>
                    <span className="font-semibold text-slate-800">Standard Accessories Kit</span>
                    <p className="text-[11px] text-slate-600">OEM 3D mats, mudflaps, boot tray & car care kit</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(pricing.breakup.mandatoryAccessories)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5">
                  <div>
                    <span className="font-semibold text-slate-800">FASTag & Registration Processing</span>
                    <p className="text-[11px] text-slate-600">Smart card RC, HSRP plate fixation & RFID tag</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(pricing.breakup.registrationAndFastag)}
                  </span>
                </div>

                {pricing.breakup.offersDiscount > 0 && (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold">Dealership Festive Benefit</span>
                        <p className="text-[11px] text-emerald-700">Special Lucknow regional purchase discount</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">
                      - {formatINR(pricing.breakup.offersDiscount)}
                    </span>
                  </div>
                )}

                {/* Total High-Impact Row */}
                <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-blue-400 font-bold block">
                      Estimated On-Road Total ({pricing.city})
                    </span>
                    <span className="text-[11px] text-slate-400">All statutory inclusions accounted for</span>
                  </div>
                  <span className="font-display font-extrabold text-2xl text-white">
                    {formatINR(pricing.totalOnRoadPrice)}
                  </span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{pricing.disclaimer}</span>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Snapshots are attached automatically to your enquiry record.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onProceedTestDrive && (
              <button
                onClick={() => {
                  onClose();
                  onProceedTestDrive();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                Book Test Drive
              </button>
            )}

            {onProceedEnquiry && pricing && (
              <button
                onClick={() => {
                  onClose();
                  onProceedEnquiry(pricing);
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Enquire with this Quote</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
