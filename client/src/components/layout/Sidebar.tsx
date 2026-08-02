import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, Tag, LogOut, Wallet } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  onOpenCategoryModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCategoryModal }) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const isDashboard = location.pathname === '/dashboard';
  const isGoals = location.pathname === '/goals';

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between p-4 hidden lg:flex shrink-0">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-xs">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">Vaultify</h1>
            <p className="text-xs text-gray-400 font-medium">Finance Tracker</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isDashboard
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/goals"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isGoals
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Target size={20} />
            <span>Financial Goals</span>
          </Link>

          {onOpenCategoryModal && (
            <button
              onClick={onOpenCategoryModal}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all text-left"
            >
              <Tag size={20} />
              <span>Categories</span>
            </button>
          )}
        </nav>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="truncate">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name || user?.email}</p>
            <p className="text-xs font-semibold text-emerald-600">{user?.currency || 'PLN'}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
