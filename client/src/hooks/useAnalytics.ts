import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { MonthlySummary, CategoryBreakdownItem } from '../types/analytics';

export const useMonthlySummary = (month: number, year: number) => {
  return useQuery({
    queryKey: ['analytics', 'summary', month, year],
    queryFn: async () => {
      const { data } = await api.get<MonthlySummary>('/analytics/summary', {
        params: { month, year },
      });
      return data;
    },
  });
};

export const useCategoryBreakdown = (
  month: number,
  year: number,
  type: 'INCOME' | 'EXPENSE' = 'EXPENSE'
) => {
  return useQuery({
    queryKey: ['analytics', 'by-category', month, year, type],
    queryFn: async () => {
      const { data } = await api.get<CategoryBreakdownItem[]>('/analytics/by-category', {
        params: { month, year, type },
      });
      return data;
    },
  });
};
