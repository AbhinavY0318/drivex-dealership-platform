import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Dealership Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Car className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-2xl text-white tracking-tight">
                Drive<span className="text-blue-500">X</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              DriveX is Lucknow's premier authorized passenger vehicle dealership network.
              Operating 3 luxury brand showrooms, 2 multi-bay service workshops, and 1 certified used-car yard across Lucknow, Uttar Pradesh.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>DPDP 2023 Compliant Dealership</span>
            </div>
          </div>

          {/* Showroom Locations in Lucknow */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-base tracking-wide">
              Showrooms in Lucknow
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Hazratganj Flagship</strong>
                  <span>Plot 14, MG Marg, Hazratganj, Lucknow 226001</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Gomti Nagar Experience Centre</strong>
                  <span>TCG 4/4, Vibhuti Khand, Gomti Nagar 226010</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Kanpur Road Mega Hub & Yard</strong>
                  <span>Transport Nagar Metro Road, Lucknow 226012</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-base tracking-wide">
              Explore DriveX
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/vehicles" className="hover:text-blue-400 transition-colors">
                  New Cars & On-Road Pricing
                </Link>
              </li>
              <li>
                <Link to="/used-vehicles" className="hover:text-blue-400 transition-colors">
                  Certified Used Cars (150-Point Inspection)
                </Link>
              </li>
              <li>
                <Link to="/book-test-drive" className="hover:text-blue-400 transition-colors">
                  Book Doorstep / Showroom Test Drive
                </Link>
              </li>
              <li>
                <Link to="/enquiry" className="hover:text-blue-400 transition-colors">
                  Corporate & Individual Purchase Enquiry
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">
                  Sales Consultant CRM Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-base tracking-wide">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>Sales Hotline: +91 522 2618900</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>Email: contact@drivex.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Mon - Sun: 09:30 AM - 08:00 PM</span>
              </div>
              <div className="p-3 mt-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                24x7 Dealership Roadside Assistance: <span className="text-white font-semibold">1800-202-6000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 DriveX Automotive Dealership Ltd. All rights reserved. Registered in Lucknow, India.</p>
          <p className="max-w-xl text-center md:text-right">
            Disclaimer: On-road price estimates displayed are simulation figures based on regional Uttar Pradesh RTO
            charges and insurance estimations. Final invoice pricing will be issued by the authorized dealership at time of delivery.
          </p>
        </div>
      </div>
    </footer>
  );
};
