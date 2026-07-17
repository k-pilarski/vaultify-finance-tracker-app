import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

const DashboardPlaceholder = () => {
  const { user, logout } = useAuthStore();
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center space-y-6 max-w-md w-full text-center">
        <div className="bg-blue-500/10 p-4 rounded-full">
          <Wallet className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400">Welcome back, {user?.name || user?.email}</p>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            {user?.currency}
          </span>
        </div>
        <button
          onClick={() => logout()}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 transition-colors rounded text-white font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}