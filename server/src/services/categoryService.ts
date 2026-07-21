import { PrismaClient, Prisma, TransactionType, Category } from '@prisma/client';

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

export const getUserCategories = async (userId: string, type?: TransactionType) => {
  const where: Prisma.CategoryWhereInput = { userId };
  if (type) {
    where.type = type;
  }
  return await prisma.category.findMany({
    where,
    orderBy: { name: 'asc' },
  });
};

export const createCategory = async (userId: string, data: { name: string; type: TransactionType; color: string; icon: string }) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      name_type_userId: {
        name: data.name,
        type: data.type,
        userId,
      }
    }
  });

  if (existingCategory) {
    throw new Error('Category with this name and type already exists');
  }

  return await prisma.category.create({
    data: {
      ...data,
      userId,
      isDefault: false,
    },
  });
};

export const updateCategory = async (userId: string, categoryId: string, data: { name?: string; color?: string; icon?: string }) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.userId !== userId) {
    throw new Error('Category not found or access denied');
  }

  // If changing name, ensure uniqueness
  if (data.name && data.name !== category.name) {
    const existingCategory = await prisma.category.findUnique({
      where: {
        name_type_userId: {
          name: data.name,
          type: category.type,
          userId,
        }
      }
    });

    if (existingCategory) {
      throw new Error('Category with this name and type already exists');
    }
  }

  return await prisma.category.update({
    where: { id: categoryId },
    data,
  });
};

export const deleteCategory = async (userId: string, categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.userId !== userId) {
    throw new Error('Category not found or access denied');
  }

  if (category.isDefault) {
    throw new Error('Cannot delete default categories'); // Will be caught and mapped to 400 in controller
  }

  return await prisma.category.delete({
    where: { id: categoryId },
  });
};
