import { PrismaClient, Prisma, Goal, TransactionType, Transaction } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateGoalData {
  name: string;
  targetAmount: number;
  deadline?: string | Date | null;
  color: string;
  icon: string;
}

export interface DepositToGoalData {
  amount: number;
  categoryId: string;
  description?: string;
}

export const getGoals = async (userId: string): Promise<Goal[]> => {
  return await prisma.goal.findMany({
    where: { userId },
    orderBy: [
      { deadline: { sort: 'asc', nulls: 'last' } },
      { createdAt: 'desc' },
    ],
  });
};

export const createGoal = async (userId: string, data: CreateGoalData): Promise<Goal> => {
  return await prisma.goal.create({
    data: {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      deadline: data.deadline ? new Date(data.deadline) : null,
      color: data.color,
      icon: data.icon,
      userId,
    },
  });
};

export const deleteGoal = async (userId: string, goalId: string): Promise<Goal> => {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal || goal.userId !== userId) {
    throw new Error('Goal not found or access denied');
  }

  return await prisma.goal.delete({
    where: { id: goalId },
  });
};

export const depositToGoal = async (
  userId: string,
  goalId: string,
  data: DepositToGoalData
): Promise<{ goal: Goal; transaction: Transaction }> => {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal || goal.userId !== userId) {
    throw new Error('Goal not found or access denied');
  }

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category || category.userId !== userId) {
    throw new Error('Category not found or access denied');
  }

  if (category.type !== TransactionType.EXPENSE) {
    throw new Error('Category must be of type EXPENSE for deposits');
  }

  const description = data.description || `Deposit to goal: ${goal.name}`;

  const [newTransaction, updatedGoal] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        amount: data.amount,
        type: TransactionType.EXPENSE,
        description,
        userId,
        categoryId: data.categoryId,
        goalId: goal.id,
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
    }),
    prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: {
          increment: data.amount,
        },
      },
    }),
  ]);

  return {
    goal: updatedGoal,
    transaction: newTransaction,
  };
};
