import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wallet,
  LayoutDashboard,
  Target,
  LogOut,
  Calendar,
  Menu,
  X,
  Tag,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDateFilterStore } from '../../store/useDateFilterStore';

interface NavbarProps {
  onOpenCategoryModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCategoryModal }) => {
  const { user, logout } = useAuthStore();
  const { month, year, setMonth, setYear } = useDateFilterStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const isDashboard = location.pathname === '/dashboard';
  const isGoals = location.pathname === '/goals';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand & Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-xs">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">Vaultify</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isDashboard
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/goals"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isGoals
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Target size={18} />
                <span>Financial Goals</span>
              </Link>
              {onOpenCategoryModal && (
                <button
                  onClick={onOpenCategoryModal}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Tag size={18} />
                  <span>Categories</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Controls: Global Month/Year Selector + User Profile + Logout */}
          <div className="flex items-center gap-3">
            {/* Global Date Selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 p-1.5 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 px-1 text-gray-400">
                <Calendar size={15} />
              </div>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer py-0.5"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <span className="text-gray-300 text-xs">/</span>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer py-0.5"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile Info */}
            <div className="hidden sm:flex items-center gap-2.5 text-sm pl-2">
              <span className="font-semibold text-gray-800">{user?.name || user?.email}</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                {user?.currency || 'PLN'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <nav className="flex flex-col gap-1">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isDashboard ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/goals"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isGoals ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Target size={18} />
                <span>Financial Goals</span>
              </Link>
              {onOpenCategoryModal && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCategoryModal();
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 text-left w-full"
                >
                  <Tag size={18} />
                  <span>Categories</span>
                </button>
              )}
            </nav>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-700">{user?.name || user?.email}</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                {user?.currency || 'PLN'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
