import React from 'react';
import { Wallet } from 'lucide-react';

// Główny komponent aplikacji pełniący rolę weryfikacji konfiguracji (Tailwind, Lucide, React Query)
export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center space-y-6 max-w-md w-full text-center">
        <div className="bg-blue-500/10 p-4 rounded-full">
          <Wallet className="w-12 h-12 text-blue-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-100">
          VaultifyFT
        </h1>
        <p className="text-slate-400">
          Personal Finance Tracker
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            Tailwind CSS Active
          </span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
            TanStack Query Active
          </span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
            Lucide Icons Active
          </span>
        </div>
      </div>
    </div>
  );
}
