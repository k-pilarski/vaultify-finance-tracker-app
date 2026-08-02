import React from 'react';
import {
  Folder,
  Utensils,
  ShoppingBag,
  Home,
  Car,
  Coffee,
  Film,
  Wallet,
  Plane,
  Heart,
  Laptop,
  PiggyBank,
  ShieldCheck,
  Trophy,
  GraduationCap,
  Building,
  Gift,
  Sparkles,
  TrendingUp,
  Briefcase,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useCategoryBreakdown } from '../../hooks/useAnalytics';
import { useAuthStore } from '../../store/useAuthStore';

const ICONS: Record<string, React.ElementType> = {
  Folder,
  Utensils,
  ShoppingBag,
  Home,
  Car,
  Coffee,
  Film,
  Wallet,
  Plane,
  Heart,
  Laptop,
  PiggyBank,
  ShieldCheck,
  Trophy,
  GraduationCap,
  Building,
  Gift,
  Sparkles,
  TrendingUp,
  Briefcase,
  DollarSign,
  Tag,
};

interface CategoryProgressBarsProps {
  month: number;
  year: number;
  type?: 'INCOME' | 'EXPENSE';
}

export const CategoryProgressBars: React.FC<CategoryProgressBarsProps> = ({
  month,
  year,
  type = 'EXPENSE',
}) => {
  const { data: breakdown, isLoading, isError } = useCategoryBreakdown(month, year, type);
  const { user } = useAuthStore();

  const currencySymbol = user?.currency || 'PLN';

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-6" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <p className="text-red-500 text-sm font-medium">Failed to load category progress bars.</p>
      </div>
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center py-12">
        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 w-fit mx-auto mb-3">
          <Folder size={28} />
        </div>
        <h4 className="text-sm font-semibold text-gray-800">No Category Breakdown</h4>
        <p className="text-xs text-gray-500 mt-1">
          No spending recorded for this period to display breakdown.
        </p>
      </div>
    );
  }

  const title = type === 'EXPENSE' ? 'Top Expense Categories' : 'Top Income Categories';

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">Sorted by total amount descending</p>
        </div>
      </div>

      <div className="space-y-5">
        {breakdown.map((item) => {
          const IconComponent = ICONS[item.icon] || Folder;
          return (
            <div key={item.categoryId} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-1.5 rounded-lg text-white shadow-xs flex items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    <IconComponent size={14} />
                  </div>
                  <span className="font-semibold text-gray-800">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">
                    {item.totalAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    <span className="text-xs font-normal text-gray-500">{currencySymbol}</span>
                  </span>
                  <span className="text-xs font-semibold text-gray-500 w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
