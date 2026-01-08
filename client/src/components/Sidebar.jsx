import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, Link as LinkIcon } from "lucide-react";

const navItems = [
  { name: "Event Types", path: "/dashboard", icon: LinkIcon },
  { name: "Bookings", path: "/bookings", icon: Calendar },
  { name: "Availability", path: "/availability", icon: Clock },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed top-0 left-0 z-50 flex flex-col w-64 min-h-screen p-4 bg-black border-r border-gray-800">
      {/* --- LOGO FIX --- */}
      <div className="flex items-center gap-3 px-2 mb-8">
        {/* 1. Icon (White Circle) */}
        <div className="flex items-center justify-center w-8 h-8 overflow-hidden bg-white rounded-full shrink-0">
          {/* Agar image file hai toh yeh line rakho: */}
          <img
            src="/cal-logo.png"
            alt="Logo"
            className="object-cover w-full h-full"
          />

          {/* Agar image nahi hai, toh upar wali line hata kar yeh use karo: */}
          {/* <span className="text-lg font-bold text-black">C</span> */}
        </div>

        {/* 2. Text (Circle ke bahar) */}
        <h1 className="text-lg font-bold tracking-tight text-white">
          Cal Scheduling
        </h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-[#1a1a1a] text-white"
                  : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile (Bottom) */}
      <div className="pt-4 mt-auto border-t border-gray-800">
        <div className="flex items-center gap-3 px-2">
          <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-300 bg-gray-800 border border-gray-700 rounded-full">
            RM
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              Rohit Maji
            </p>
            <p className="text-xs text-gray-500 truncate">rohit@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
