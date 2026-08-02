import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { SummaryCards } from '../components/analytics/SummaryCards';
import { ExpensePieChart } from '../components/analytics/ExpensePieChart';
import { CategoryProgressBars } from '../components/analytics/CategoryProgressBars';
import { CategoryModal } from '../components/categories/CategoryModal';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { GetTransactionsFilters } from '../types/transaction';
import { useTransactions } from '../hooks/useTransactions';
import { useDateFilterStore } from '../store/useDateFilterStore';
import { PlusCircle, LayoutGrid, Receipt } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { month, year, setMonth, setYear } = useDateFilterStore();

  const [filters, setFilters] = useState<GetTransactionsFilters>({
    month,
    year,
    type: 'ALL',
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Sync filters whenever global month/year store changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      month,
      year,
    }));
  }, [month, year]);

  const handleSetFilters = (newFilters: GetTransactionsFilters) => {
    setFilters(newFilters);
    if (newFilters.month && newFilters.month !== month) {
      setMonth(newFilters.month);
    }
    if (newFilters.year && newFilters.year !== year) {
      setYear(newFilters.year);
    }
  };

  const { data: transactions, isLoading } = useTransactions(filters);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar with global month/year selector */}
      <Navbar onOpenCategoryModal={() => setIsCategoryModalOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* KPI Summary Cards */}
        <section>
          <SummaryCards month={month} year={year} />
        </section>

        {/* 2-Column Responsive Dashboard Assembly */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Analytics Charts */}
          <div className="lg:col-span-1 space-y-8">
            <ExpensePieChart month={month} year={year} type="EXPENSE" />
            <CategoryProgressBars month={month} year={year} type="EXPENSE" />
          </div>

          {/* Right Column: Quick Actions, Filters & Transactions Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Receipt className="text-blue-600" size={20} />
                  Transactions Overview
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage and record your financial activities
                </p>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 font-semibold text-sm transition-all shadow-xs"
                >
                  <LayoutGrid size={17} />
                  <span>New Category</span>
                </button>
                <button
                  onClick={() => setIsTransactionModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
                >
                  <PlusCircle size={18} />
                  <span>Quick Add Transaction</span>
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <TransactionFilters filters={filters} setFilters={handleSetFilters} />

            {/* Transactions Data Table */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
                <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {transactions?.length || 0} records
                </span>
              </div>
              <TransactionTable transactions={transactions || []} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
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
