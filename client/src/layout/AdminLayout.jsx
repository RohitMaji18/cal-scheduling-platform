import Sidebar from "../components/Sidebar";
import { Toaster } from "react-hot-toast";

/**
 * AdminLayout Component
 * ---------------------
 * This acts as the shell for all protected dashboard pages.
 * It ensures the Sidebar is always visible and handles the Toast notifications.
 */
export default function AdminLayout({ children }) {
  return (
    // Main Container: Black background, full height
    <div className="flex w-full min-h-screen text-white bg-black">
      {/* 1. Fixed Navigation Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      {/* ml-64 pushes content to the right to make space for the fixed sidebar */}
      <div className="flex-1 p-8 ml-64 bg-black">
        <div className="max-w-5xl mx-auto">{children}</div>
      </div>

      {/* 3. Global Toast Notifications */}
      {/* Positioned bottom-right with a dark theme to match the app */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1a1a", // Dark Gray background
            color: "#fff", // White text
            border: "1px solid #333", // Subtle border
          },
        }}
      />
    </div>
  );
}
