import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { TestDriveBooking } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { CalendarCheck, Car, MapPin, Clock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<TestDriveBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isAuthenticated) {
      api.testDrives
        .getMyBookings()
        .then((res) => {
          if (res.success && res.data) setBookings(res.data);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Sign in to View Bookings</h2>
        <p className="text-xs text-slate-500">
          Please log in to review your scheduled test drive appointments and showroom confirmations.
        </p>
        <Link to="/login" className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-glow">
          Log In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <CalendarCheck className="w-4 h-4" />
          <span>Customer Appointment History</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-1">
          My VIP Test Drive Bookings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Showing confirmed showroom and doorstep appointments for {user?.name}
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs">Loading appointments...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No Active Appointments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Experience our 2026 vehicle lineup on the road with an exclusive personalized test drive.
          </p>
          <Link
            to="/book-test-drive"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-glow"
          >
            <span>Book a Test Drive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {b.bookingReference}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-slate-900">
                  {(b.vehicleModelId as any)?.name || 'DriveX Vehicle'}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{b.bookingDate} • {b.timeSlot}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{(b.showroomId as any)?.name || 'Lucknow Showroom'}</span>
                  </span>
                </div>
              </div>

              <div className="sm:text-right text-xs text-slate-500">
                <span className="block font-semibold text-slate-800">
                  Lead Consultant: {(b.consultantId as any)?.name || 'Assigned Showroom Team'}
                </span>
                <span className="text-[11px] block mt-0.5">Please carry your valid driving licence</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
