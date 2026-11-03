import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  Car,
  ShieldCheck,
  CalendarCheck,
  Building2,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'New Vehicles', path: '/vehicles', icon: Car },
    { label: 'Certified Used Cars', path: '/used-vehicles', icon: ShieldCheck },
    { label: 'Book Test Drive', path: '/book-test-drive', icon: CalendarCheck },
    { label: 'Showrooms', path: '/#showrooms', icon: Building2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-2xl tracking-tight text-white">Drive</span>
                <span className="font-display font-black text-2xl text-blue-500">X</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Lucknow Premier Dealership
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-70" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs & Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && role === 'SALES_CONSULTANT' && (
              <Link
                to="/crm/leads"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Sales CRM Inbox</span>
              </Link>
            )}

            {isAuthenticated && role === 'ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Admin CMS</span>
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-medium transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate text-slate-200">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-premium border border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-800/80">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'BUYER' && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <CalendarCheck className="w-4 h-4 text-slate-400" />
                        <span>My Test Drives</span>
                      </Link>
                    )}

                    {user.role === 'SALES_CONSULTANT' && (
                      <Link
                        to="/crm/leads"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Consultant Portal</span>
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Dealership Management</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 text-left border-t border-slate-800/80"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-glow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/98 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive(item.path) ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 opacity-80" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-900 rounded-lg">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="font-semibold text-white">{user.name}</p>
                  <span className="text-xs text-blue-400 font-bold">{user.role}</span>
                </div>
                {role === 'SALES_CONSULTANT' && (
                  <Link
                    to="/crm/leads"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-blue-600 text-white"
                  >
                    Open CRM Inbox
                  </Link>
                )}
                {role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-indigo-600 text-white"
                  >
                    Open Admin CMS
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 text-red-400"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold rounded-lg bg-blue-600 text-white shadow-glow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
