import React from 'react';
import { GetTransactionsFilters } from '../../types/transaction';
import { useCategories } from '../../hooks/useCategories';
import { TransactionType } from '../../types/category';

interface TransactionFiltersProps {
  filters: GetTransactionsFilters;
  setFilters: (filters: GetTransactionsFilters) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({ filters, setFilters }) => {
  const categoryTypeParam = filters.type === 'ALL' ? undefined : (filters.type as TransactionType);
  const { data: categories } = useCategories(categoryTypeParam);

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
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleFilterChange = (key: keyof GetTransactionsFilters, value: any) => {
    // When changing type, clear categoryId because the selected category might not belong to the new type
    if (key === 'type' && value !== filters.type) {
      setFilters({ ...filters, [key]: value, categoryId: undefined });
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
      
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Type</label>
        <select
          value={filters.type || 'ALL'}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 hover:bg-white transition-colors"
        >
          <option value="ALL">All Types</option>
          <option value="EXPENSE">Expenses</option>
          <option value="INCOME">Incomes</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Category</label>
        <select
          value={filters.categoryId || ''}
          onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 hover:bg-white transition-colors"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Month</label>
        <select
          value={filters.month || ''}
          onChange={(e) => handleFilterChange('month', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 hover:bg-white transition-colors"
        >
          <option value="">All Months</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Year</label>
        <select
          value={filters.year || ''}
          onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 hover:bg-white transition-colors"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

    </div>
  );
};
