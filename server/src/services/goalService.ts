import { PrismaClient, Prisma, Goal } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateGoalData {
  name: string;
  targetAmount: number;
  deadline?: string | Date | null;
  color: string;
  icon: string;
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
