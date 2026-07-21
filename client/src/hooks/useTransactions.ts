import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Transaction, GetTransactionsFilters, CreateTransactionData, UpdateTransactionData } from '../types/transaction';

export const useTransactions = (filters: GetTransactionsFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      // Remove undefined or 'ALL' filters
      const params: Record<string, any> = {};
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.type && filters.type !== 'ALL') params.type = filters.type;

      const { data } = await api.get<{ transactions: Transaction[] }>('/transactions', { params });
      return data.transactions;
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData: CreateTransactionData) => {
      const { data } = await api.post<{ transaction: Transaction }>('/transactions', transactionData);
      return data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTransactionData }) => {
      const { data: responseData } = await api.put<{ transaction: Transaction }>(`/transactions/${id}`, data);
      return responseData.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      await api.delete(`/transactions/${transactionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
