import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { CategoryList } from '../components/categories/CategoryList';
import { CategoryModal } from '../components/categories/CategoryModal';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { GetTransactionsFilters } from '../types/transaction';
import { useTransactions } from '../hooks/useTransactions';
import { LogOut, PlusCircle, Wallet, LayoutGrid, Receipt } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  
  const [filters, setFilters] = useState<GetTransactionsFilters>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: 'ALL',
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const { data: transactions, isLoading } = useTransactions(filters);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-inner">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vaultify</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <span className="text-gray-500">Welcome,</span>
                <span className="font-semibold text-gray-800">{user?.name || user?.email}</span>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                  {user?.currency}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Top Controls Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex-1 w-full">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Receipt className="text-blue-500" size={20} />
              Filter Transactions
            </h2>
            <TransactionFilters filters={filters} setFilters={setFilters} />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0 pb-1">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all shadow-sm"
            >
              <LayoutGrid size={18} />
              <span>New Category</span>
            </button>
            <button
              onClick={() => setIsTransactionModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle size={18} />
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Categories Preview */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Your Categories</h2>
          <CategoryList type={filters.type === 'ALL' ? undefined : filters.type} />
        </section>

        {/* Data Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Transactions</h2>
            <span className="text-sm text-gray-500">
              {transactions?.length || 0} records found
            </span>
          </div>
          <TransactionTable transactions={transactions || []} isLoading={isLoading} />
        </section>

      </main>

      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
      />
      
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />
    </div>
  );
};
