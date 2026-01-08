import Sidebar from "../components/Sidebar";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }) {
  return (
    // bg-black aur min-h-screen zaruri hai
    <div className="min-h-screen w-full bg-black text-white flex">
      {/* Sidebar Fixed */}
      <Sidebar />

      {/* Main Content Area (Sidebar ke bagal mein) */}
      <div className="flex-1 ml-64 p-8 bg-black">
        <div className="max-w-5xl mx-auto">{children}</div>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1a1a", // Dark Gray Toast
            color: "#fff",
            border: "1px solid #333",
          },
        }}
      />
    </div>
  );
}
