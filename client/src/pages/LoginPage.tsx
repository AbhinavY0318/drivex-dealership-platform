import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Logged in successfully');

      // Check role in token/state or redirect accordingly
      const storedUser = localStorage.getItem('drivex_token');
      if (email.includes('admin')) {
        navigate('/admin');
      } else if (email.includes('consultant') || email.includes('rohit') || email.includes('priya') || email.includes('amit') || email.includes('sneha')) {
        navigate('/crm/leads');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-premium">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto text-white shadow-glow">
            <Car className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            Sign In to DriveX
          </h2>
          <p className="text-xs text-slate-500">
            Access your showroom bookings, VIP quotes, or consultant CRM inbox
          </p>
        </div>

        {/* Demo Quick-Fill Accounts Buttons */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Recruiter & Evaluator Quick Demo Logins:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('customer@drivex.in', 'Buyer@2026')}
              className="p-2 rounded-xl text-left border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
            >
              <strong className="block text-xs text-slate-900">Buyer Customer</strong>
              <span className="text-[10px] text-slate-500 font-mono">customer@drivex.in</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('priya.verma@drivex.in', 'Consultant@2026')}
              className="p-2 rounded-xl text-left border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
            >
              <strong className="block text-xs text-blue-700">Sales Consultant</strong>
              <span className="text-[10px] text-slate-500 font-mono">priya.verma@drivex.in</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('rohit.sharma@drivex.in', 'Consultant@2026')}
              className="p-2 rounded-xl text-left border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
            >
              <strong className="block text-xs text-blue-700">Senior Consultant</strong>
              <span className="text-[10px] text-slate-500 font-mono">rohit.sharma@drivex.in</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@drivex.in', 'Admin@2026')}
              className="p-2 rounded-xl text-left border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
            >
              <strong className="block text-xs text-indigo-700">Dealership Admin</strong>
              <span className="text-[10px] text-slate-500 font-mono">admin@drivex.in</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Email Address</span>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@drivex.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700">Password</span>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Register as Customer
          </Link>
        </div>
      </div>
    </div>
  );
};
