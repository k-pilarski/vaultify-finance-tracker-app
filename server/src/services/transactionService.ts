import { PrismaClient, Prisma, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

interface GetTransactionsParams {
  month?: number; // 1-12
  year?: number;
  categoryId?: string;
  type?: TransactionType;
}

export const getTransactions = async (userId: string, params: GetTransactionsParams) => {
  const where: Prisma.TransactionWhereInput = { userId };

  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }

  if (params.type) {
    where.type = params.type;
  }

  if (params.month !== undefined && params.year !== undefined) {
    // Note: month in JS Date is 0-indexed, but assuming params.month is 1-12
    const startDate = new Date(params.year, params.month - 1, 1);
    const endDate = new Date(params.year, params.month, 1); // 1st day of next month

    where.date = {
      gte: startDate,
      lt: endDate,
    };
  }

  return await prisma.transaction.findMany({
    where,
    include: {
      category: {
        select: {
          name: true,
          color: true,
          icon: true,
          type: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
};

interface CreateTransactionData {
  amount: number;
  type: TransactionType;
  categoryId: string;
  description?: string;
  date: string | Date;
}

export const createTransaction = async (userId: string, data: CreateTransactionData) => {
  // Verify category belongs to user
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category || category.userId !== userId) {
    throw new Error('Category not found or access denied');
  }

  // Double check if types match (optional but good practice)
  if (category.type !== data.type) {
    throw new Error('Transaction type does not match category type');
  }

  return await prisma.transaction.create({
    data: {
      amount: data.amount,
      type: data.type,
      description: data.description,
      date: new Date(data.date),
      userId,
      categoryId: data.categoryId,
    },
    include: {
      category: {
        select: {
          name: true,
          color: true,
          icon: true,
          type: true,
        },
      },
    },
  });
};

interface UpdateTransactionData {
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  description?: string;
  date?: string | Date;
}

export const updateTransaction = async (userId: string, transactionId: string, data: UpdateTransactionData) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction || transaction.userId !== userId) {
    throw new Error('Transaction not found or access denied');
  }

  // If changing category, verify new category belongs to user
  if (data.categoryId && data.categoryId !== transaction.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new Error('Category not found or access denied');
    }

    if (data.type && category.type !== data.type) {
      throw new Error('Transaction type does not match category type');
    } else if (!data.type && category.type !== transaction.type) {
       throw new Error('Transaction type does not match category type');
    }
  }

  const updateData: any = { ...data };
  if (data.date) {
    updateData.date = new Date(data.date);
  }

  return await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
    include: {
      category: {
        select: {
          name: true,
          color: true,
          icon: true,
          type: true,
        },
      },
    },
  });
};

export const deleteTransaction = async (userId: string, transactionId: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction || transaction.userId !== userId) {
    throw new Error('Transaction not found or access denied');
  }

  return await prisma.transaction.delete({
    where: { id: transactionId },
  });
};
