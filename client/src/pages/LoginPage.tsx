import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles, Loader2, LogOut } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { user, isAuthenticated, login, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    try {
      // Cleanly clear existing session if switching accounts
      if (isAuthenticated) {
        await logout();
      }
      await login({ email: loginEmail.trim(), password: loginPass });
      toast.success('Logged in successfully');

      const target = loginEmail.includes('admin')
        ? '/admin'
        : loginEmail.includes('consultant') ||
          loginEmail.includes('rohit') ||
          loginEmail.includes('priya') ||
          loginEmail.includes('amit') ||
          loginEmail.includes('sneha')
        ? '/crm/leads'
        : '/';
      // Use replace: true so /login is cleanly replaced in the browser history stack
      navigate(target, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    executeLogin(demoEmail, demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-premium">
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

        {/* Active Session Warning & Switcher Banner */}
        {isAuthenticated && user && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Active Session Detected
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-amber-900">
              Currently signed in as <strong>{user.name}</strong> ({user.email}).
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  toast.info('Logged out from current session');
                }}
                className="font-bold text-red-600 hover:text-red-700 underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
              <span className="text-amber-300">•</span>
              <Link
                to={user.role === 'ADMIN' ? '/admin' : user.role === 'SALES_CONSULTANT' ? '/crm/leads' : '/'}
                className="font-bold text-blue-700 hover:text-blue-800 underline"
              >
                Go to {user.role === 'ADMIN' ? 'Admin CMS' : 'CRM Leads'} &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Demo Quick-Fill Accounts Buttons */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>1-Click Switch & Demo Sign In:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickFill('customer@drivex.in', 'Buyer@2026')}
              className="p-2.5 rounded-xl text-left border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <strong className="block text-xs text-slate-900 group-hover:text-blue-600">Buyer Customer</strong>
                <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Login &rarr;</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block truncate">customer@drivex.in</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickFill('priya.verma@drivex.in', 'Consultant@2026')}
              className="p-2.5 rounded-xl text-left border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <strong className="block text-xs text-blue-700 group-hover:text-blue-800">Sales Consultant</strong>
                <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Login &rarr;</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block truncate">priya.verma@drivex.in</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickFill('rohit.sharma@drivex.in', 'Consultant@2026')}
              className="p-2.5 rounded-xl text-left border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <strong className="block text-xs text-blue-700 group-hover:text-blue-800">Senior Consultant</strong>
                <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Login &rarr;</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block truncate">rohit.sharma@drivex.in</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickFill('admin@drivex.in', 'Admin@2026')}
              className="p-2.5 rounded-xl text-left border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <strong className="block text-xs text-indigo-700 group-hover:text-indigo-800">Dealership Admin</strong>
                <span className="text-[10px] text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Login &rarr;</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block truncate">admin@drivex.in</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
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
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
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
