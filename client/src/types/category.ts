export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
  userId: string;
}

export interface CreateCategoryData {
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
  icon?: string;
}
