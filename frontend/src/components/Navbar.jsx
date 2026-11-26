import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, Bell, Shield } from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  const { user, logout, role } = useAuth();

  const getRoleBadge = (r) => {
    switch (r) {
      case 'ADMINISTRATOR':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LECTURER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'STUDENT':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const displayName = user?.profile?.name || user?.username || 'User';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-blue-100 backdrop-blur-xl shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-blue-50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              D
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-gray-900">
                Digital Attendance System
              </span>
            </div>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-gray-900 leading-tight">{displayName}</span>
            <span className={`text-[10px] font-semibold mt-0.5 px-2 py-0.5 rounded-full border self-end ${getRoleBadge(role)}`}>
              {role}
            </span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-xs">
            <User className="w-4 h-4" />
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
