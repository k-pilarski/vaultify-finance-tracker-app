import { PrismaClient, Prisma, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

export const seedDefaultCategories = async (userId: string, tx?: Prisma.TransactionClient) => {
  const defaultCategories = [
    // Expenses
    { name: 'Food', type: TransactionType.EXPENSE, color: '#EF4444', icon: 'Utensils' },
    { name: 'Transport', type: TransactionType.EXPENSE, color: '#F97316', icon: 'Car' },
    { name: 'Housing', type: TransactionType.EXPENSE, color: '#EAB308', icon: 'Home' },
    { name: 'Entertainment', type: TransactionType.EXPENSE, color: '#EC4899', icon: 'Film' },
    { name: 'Health', type: TransactionType.EXPENSE, color: '#10B981', icon: 'Heart' },
    // Incomes
    { name: 'Salary', type: TransactionType.INCOME, color: '#22C55E', icon: 'Wallet' },
    { name: 'Freelance', type: TransactionType.INCOME, color: '#3B82F6', icon: 'Laptop' },
    { name: 'Investments', type: TransactionType.INCOME, color: '#6366F1', icon: 'TrendingUp' },
  ];

  const data = defaultCategories.map(cat => ({
    ...cat,
    userId,
    isDefault: true,
  }));

  const client = tx || prisma;
  await client.category.createMany({
    data,
  });
};
