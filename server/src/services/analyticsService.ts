import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  totalAmount: number;
  percentage: number;
}

const round2 = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;

export const getMonthlySummary = async (
  userId: string,
  month: number,
  year: number
): Promise<MonthlySummary> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const summary = await prisma.transaction.groupBy({
    by: ['type'],
    _sum: {
      amount: true,
    },
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  for (const item of summary) {
    const amount = item._sum.amount ? Number(item._sum.amount) : 0;
    if (item.type === TransactionType.INCOME) {
      totalIncome = amount;
    } else if (item.type === TransactionType.EXPENSE) {
      totalExpense = amount;
    }
  }

  totalIncome = round2(totalIncome);
  totalExpense = round2(totalExpense);
  const balance = round2(totalIncome - totalExpense);

  return {
    totalIncome,
    totalExpense,
    balance,
  };
};

export const getCategoryBreakdown = async (
  userId: string,
  month: number,
  year: number,
  type: TransactionType = TransactionType.EXPENSE
): Promise<CategoryBreakdownItem[]> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const categoryGroups = await prisma.transaction.groupBy({
    by: ['categoryId'],
    _sum: {
      amount: true,
    },
    where: {
      userId,
      type,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  if (categoryGroups.length === 0) {
    return [];
  }

  const categoryIds = categoryGroups.map((g) => g.categoryId);
  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryIds },
    },
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
    },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const grandTotal = categoryGroups.reduce((acc, group) => {
    return acc + (group._sum.amount ? Number(group._sum.amount) : 0);
  }, 0);

  const breakdown: CategoryBreakdownItem[] = categoryGroups.map((group) => {
    const totalAmount = group._sum.amount ? round2(Number(group._sum.amount)) : 0;
    const category = categoryMap.get(group.categoryId);
    const percentage = grandTotal > 0 ? round2((totalAmount / grandTotal) * 100) : 0;

    return {
      categoryId: group.categoryId,
      name: category?.name ?? 'Unknown',
      color: category?.color ?? '#6B7280',
      icon: category?.icon ?? 'Folder',
      totalAmount,
      percentage,
    };
  });

  breakdown.sort((a, b) => b.totalAmount - a.totalAmount);

  return breakdown;
};
