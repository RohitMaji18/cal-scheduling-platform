import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";

// Import Pages
import Dashboard from "./pages/admin/Dashboard";
import Availability from "./pages/admin/Availability";
import Bookings from "./pages/admin/Bookings";
import BookingPage from "./pages/public/BookingPage";
import BookingForm from "./pages/public/BookingForm";

// Import Custom Hook
import { usePageTitle } from "./hooks/usePageTitle";

/**
 * SuccessPage Component
 * ---------------------
 * Displays a confirmation message after a successful booking.
 * Styling: Adapted for Dark Mode to match the app theme.
 */
const SuccessPage = () => {
  // Set dynamic browser tab title
  usePageTitle("Booking Confirmed");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
      <div className="bg-[#111] p-8 rounded-xl shadow-2xl border border-gray-800 text-center max-w-md w-full">
        {/* Success Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-green-500 border rounded-full bg-green-900/20 border-green-900/50">
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

        {/* Text Content */}
        <h1 className="mb-3 text-2xl font-bold text-white">
          Booking Confirmed!
        </h1>
        <p className="mb-8 text-gray-400">
          You will receive a confirmation email shortly with the meeting
          details.
        </p>

        {/* Action Button */}
        <a
          href="/"
          className="inline-block w-full px-4 py-3 font-bold text-black transition bg-white rounded-full hover:bg-gray-200"
        >
          Go back home
        </a>
      </div>
    </div>
  );
};

/**
 * App Component
 * -------------
 * Main entry point for the React application.
 * Manages routing for both Admin (Dashboard) and Public (Booking) views.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- ADMIN SECTION (Protected by Layout) --- */}
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

        {/* --- REDIRECTS --- */}
        {/* Default route redirects to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* --- PUBLIC SECTION --- */}

        {/* Success Page */}
        <Route path="/success" element={<SuccessPage />} />

        {/* Dynamic Booking Routes */}
        {/* Note: Parameters like :slug match any path, so they come last */}
        <Route path="/:slug" element={<BookingPage />} />
        <Route path="/:slug/book" element={<BookingForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
