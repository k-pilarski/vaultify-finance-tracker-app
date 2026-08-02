import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useCategoryBreakdown } from '../../hooks/useAnalytics';
import { useAuthStore } from '../../store/useAuthStore';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ExpensePieChartProps {
  month: number;
  year: number;
  type?: 'INCOME' | 'EXPENSE';
}

const CustomTooltip = ({ active, payload, currencySymbol }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl border border-gray-800 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: data.color }} />
          <span className="font-bold">{data.name}</span>
        </div>
        <div className="text-gray-300">
          Amount:{' '}
          <span className="font-semibold text-white">
            {data.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currencySymbol}
          </span>
        </div>
        <div className="text-gray-400 text-xs mt-0.5">
          Share: <span className="font-medium text-emerald-400">{data.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({
  month,
  year,
  type = 'EXPENSE',
}) => {
  const { data: breakdown, isLoading, isError } = useCategoryBreakdown(month, year, type);
  const { user } = useAuthStore();
  const currencySymbol = user?.currency || 'PLN';

  const title = type === 'EXPENSE' ? 'Expense Distribution' : 'Income Distribution';

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center min-h-[360px] animate-pulse">
        <div className="w-48 h-48 rounded-full border-8 border-gray-100 border-t-gray-200 animate-spin mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[360px] flex items-center justify-center">
        <p className="text-red-500 text-sm font-medium">Failed to load chart data.</p>
      </div>
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[360px] flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-3">
          <PieChartIcon size={32} />
        </div>
        <h4 className="text-base font-semibold text-gray-800">No Data Available</h4>
        <p className="text-xs text-gray-500 max-w-xs mt-1">
          There are no {type.toLowerCase()} transactions recorded for this selected period.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">Breakdown by category hex color code</p>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdown}
              dataKey="totalAmount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
            >
              {breakdown.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
