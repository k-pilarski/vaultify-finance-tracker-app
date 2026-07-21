import { Category, TransactionType } from './category';

export interface Transaction {
  id: string;
  amount: number | string;
  type: TransactionType;
  description?: string;
  date: string;
  userId: string;
  categoryId: string;
  category: Category;
  createdAt: string;
}

export interface GetTransactionsFilters {
  month?: number;
  year?: number;
  categoryId?: string;
  type?: TransactionType | 'ALL';
}

export interface CreateTransactionData {
  amount: number;
  type: TransactionType;
  categoryId: string;
  description?: string;
  date: string; // ISO String
}

export interface UpdateTransactionData {
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  description?: string;
  date?: string; // ISO String
}
