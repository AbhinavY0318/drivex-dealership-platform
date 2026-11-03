import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { NewCarsPage } from './pages/NewCarsPage.js';
import { NewCarDetailPage } from './pages/NewCarDetailPage.js';
import { UsedCarsPage } from './pages/UsedCarsPage.js';
import { UsedCarDetailPage } from './pages/UsedCarDetailPage.js';
import { TestDriveBookingPage } from './pages/TestDriveBookingPage.js';
import { EnquiryPage } from './pages/EnquiryPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { MyBookingsPage } from './pages/MyBookingsPage.js';
import { ConsultantDashboardPage } from './pages/ConsultantDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Website Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/vehicles" element={<NewCarsPage />} />
                <Route path="/vehicles/:slug" element={<NewCarDetailPage />} />
                <Route path="/used-vehicles" element={<UsedCarsPage />} />
                <Route path="/used-vehicles/:id" element={<UsedCarDetailPage />} />
                <Route path="/book-test-drive" element={<TestDriveBookingPage />} />
                <Route path="/enquiry" element={<EnquiryPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Logged-in Buyer Routes */}
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute allowedRoles={['BUYER', 'SALES_CONSULTANT', 'ADMIN']}>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Sales Consultant CRM Routes */}
                <Route
                  path="/crm/leads"
                  element={
                    <ProtectedRoute allowedRoles={['SALES_CONSULTANT', 'ADMIN']}>
                      <ConsultantDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Dealership Admin CMS Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
