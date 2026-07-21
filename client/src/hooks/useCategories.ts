import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Category, CreateCategoryData, TransactionType } from '../types/category';

export const useCategories = (type?: TransactionType) => {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const params = type ? { type } : {};
      const { data } = await api.get<{ categories: Category[] }>('/categories', { params });
      return data.categories;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: CreateCategoryData) => {
      const { data } = await api.post<{ category: Category }>('/categories', categoryData);
      return data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await api.delete(`/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
