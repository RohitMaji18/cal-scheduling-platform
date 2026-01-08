import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";

// All Pages
import Dashboard from "./pages/admin/Dashboard";
import Availability from "./pages/admin/Availability";
import Bookings from "./pages/admin/Bookings";

import BookingPage from "./pages/public/BookingPage";
import BookingForm from "./pages/public/BookingForm";

// Simple Success Page
const SuccessPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Booking Confirmed!
      </h1>
      <p className="text-gray-500 mb-6">
        You will receive a confirmation email shortly.
      </p>
      <a
        href="/"
        className="text-black font-medium underline hover:text-gray-700"
      >
        Go back home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Section */}
        <Route
          path="/dashboard"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/availability"
          element={
            <AdminLayout>
              <Availability />
            </AdminLayout>
          }
        />
        <Route
          path="/bookings"
          element={
            <AdminLayout>
              <Bookings />
            </AdminLayout>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Public Section */}
        <Route path="/success" element={<SuccessPage />} />

        {/* Dynamic Booking Routes (Keep at bottom) */}
        <Route path="/:slug" element={<BookingPage />} />
        <Route path="/:slug/book" element={<BookingForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
