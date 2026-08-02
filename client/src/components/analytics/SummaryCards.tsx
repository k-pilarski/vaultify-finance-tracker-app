import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useMonthlySummary } from '../../hooks/useAnalytics';
import { useAuthStore } from '../../store/useAuthStore';

interface SummaryCardsProps {
  month: number;
  year: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ month, year }) => {
  const { data: summary, isLoading, isError } = useMonthlySummary(month, year);
  const { user } = useAuthStore();

  const currencySymbol = user?.currency || 'PLN';

  const formatAmount = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return `0.00 ${currencySymbol}`;
    return `${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-medium text-center">
        Failed to load monthly summary data.
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Income',
      amount: summary.totalIncome,
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-100',
      valueColor: 'text-emerald-600',
    },
    {
      title: 'Total Expense',
      amount: summary.totalExpense,
      icon: TrendingDown,
      iconBg: 'bg-rose-50 text-rose-600',
      borderColor: 'border-rose-100',
      valueColor: 'text-rose-600',
    },
    {
      title: 'Net Balance',
      amount: summary.balance,
      icon: Wallet,
      iconBg: 'bg-indigo-50 text-indigo-600',
      borderColor: 'border-indigo-100',
      valueColor: summary.balance >= 0 ? 'text-indigo-600' : 'text-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.title}
            className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between ${card.borderColor}`}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {card.title}
              </p>
              <p className={`text-2xl font-extrabold tracking-tight ${card.valueColor}`}>
                {formatAmount(card.amount)}
              </p>
            </div>
            <div className={`p-3.5 rounded-2xl ${card.iconBg}`}>
              <IconComponent size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
