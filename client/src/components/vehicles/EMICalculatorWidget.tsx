import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { formatINR } from '../../utils/format.js';
import { Calculator, IndianRupee, PieChart, ShieldAlert } from 'lucide-react';

interface EMICalculatorWidgetProps {
  initialPrice: number;
}

export const EMICalculatorWidget: React.FC<EMICalculatorWidgetProps> = ({ initialPrice }) => {
  const [onRoadPrice, setOnRoadPrice] = useState<number>(initialPrice || 1400000);
  const [downPayment, setDownPayment] = useState<number>(Math.round((initialPrice || 1400000) * 0.2));
  const [interestRate, setInterestRate] = useState<number>(8.75);
  const [tenureMonths, setTenureMonths] = useState<number>(60); // 5 years default
  const [calculation, setCalculation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrice > 0) {
      setOnRoadPrice(initialPrice);
      setDownPayment(Math.round(initialPrice * 0.2));
    }
  }, [initialPrice]);

  useEffect(() => {
    // Validate inputs locally first
    if (downPayment >= onRoadPrice) {
      setError('Down payment cannot exceed or equal on-road price');
      return;
    }
    if (onRoadPrice <= 0 || downPayment < 0) {
      setError('Please provide valid positive figures');
      return;
    }

    setError(null);

    // Call backend API for authoritative calculation
    const timer = setTimeout(async () => {
      try {
        const res = await api.vehicles.calculateEMI({
          onRoadPrice,
          downPayment,
          annualInterestRate: interestRate,
          tenureMonths,
        });
        if (res.success && res.data) {
          setCalculation(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Error computing EMI');
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [onRoadPrice, downPayment, interestRate, tenureMonths]);

  const principalRatio =
    calculation && calculation.totalRepayment > 0
      ? Math.round((calculation.principal / calculation.totalRepayment) * 100)
      : 75;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-premium">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 tracking-tight">
            Reducing-Balance EMI Calculator
          </h3>
          <p className="text-xs text-slate-600">
            Simulate affordable monthly financing with flexible tenure and customized down payments
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Sliders and Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* On-Road Price Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Vehicle On-Road Price</span>
              <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {formatINR(onRoadPrice)}
              </span>
            </div>
            <input
              type="range"
              min={500000}
              max={3500000}
              step={25000}
              value={onRoadPrice}
              onChange={(e) => setOnRoadPrice(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>₹5 Lakh</span>
              <span>₹35 Lakh</span>
            </div>
          </div>

          {/* Down Payment Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Down Payment ({Math.round((downPayment / onRoadPrice) * 100)}%)</span>
              <span className="font-mono text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {formatINR(downPayment)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.round(onRoadPrice * 0.8)}
              step={10000}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>₹0 (Zero Down Payment)</span>
              <span>80% Max Down Payment</span>
            </div>
          </div>

          {/* Interest Rate & Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Annual Interest</span>
                <span className="font-mono text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {interestRate}%
                </span>
              </div>
              <input
                type="range"
                min={7.0}
                max={15.0}
                step={0.25}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>7.0%</span>
                <span>15.0%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Loan Tenure ({Math.round(tenureMonths / 12)} Yrs)</span>
                <span className="font-mono text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {tenureMonths} Months
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={84}
                step={12}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>1 Year</span>
                <span>7 Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-6 text-white flex flex-col justify-between shadow-premium">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-blue-400 font-bold block mb-1">
              Estimated Monthly EMI
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                {calculation ? formatINR(calculation.monthlyEMI) : '₹0'}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ month</span>
            </div>

            {/* Split Visual Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Principal ({principalRatio}%)</span>
                <span>Total Interest ({100 - principalRatio}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${principalRatio}%` }}
                  className="bg-blue-500 h-full transition-all duration-300"
                />
                <div
                  style={{ width: `${100 - principalRatio}%` }}
                  className="bg-amber-400 h-full transition-all duration-300"
                />
              </div>
            </div>

            {/* Numerical Breakdown */}
            <div className="mt-6 space-y-2.5 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-800 text-slate-300">
                <span>Principal Loan Amount:</span>
                <span className="font-mono font-bold text-white">
                  {calculation ? formatINR(calculation.principal) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-800 text-slate-300">
                <span>Total Interest Payable:</span>
                <span className="font-mono font-bold text-amber-400">
                  {calculation ? formatINR(calculation.totalInterest) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Repayment (P + I):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {calculation ? formatINR(calculation.totalRepayment) : '₹0'}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[10px] text-slate-500 text-center leading-relaxed">
            *Indicative reducing-balance amortization. Bank processing fees and GST may apply at loan sanctioning.
          </p>
        </div>
      </div>
    </div>
  );
};
