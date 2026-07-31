import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGoals, createGoal, deleteGoal, depositToGoal } from '../../src/services/goalService';
import { PrismaClient } from '@prisma/client';

vi.mock('@prisma/client', () => {
  const mPrismaClient = {
    goal: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
    $transaction: vi.fn((promises) => Promise.all(promises)),
  };
  return {
    PrismaClient: vi.fn().mockImplementation(function () {
      return mPrismaClient;
    }),
    TransactionType: {
      INCOME: 'INCOME',
      EXPENSE: 'EXPENSE',
    },
  };
});

const prismaMock = new (PrismaClient as any)();

describe('goalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGoals', () => {
    it('should fetch all goals for user ordered by deadline asc and createdAt desc', async () => {
      const mockGoals = [
        { id: 'goal-1', name: 'Car', userId: 'user-1', deadline: '2026-12-31' },
      ];
      prismaMock.goal.findMany.mockResolvedValue(mockGoals);

      const goals = await getGoals('user-1');

      expect(goals).toEqual(mockGoals);
      expect(prismaMock.goal.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: [
          { deadline: { sort: 'asc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
      });
    });
  });

  describe('createGoal', () => {
    it('should create goal with initial currentAmount set to 0', async () => {
      const goalData = {
        name: 'Vacation',
        targetAmount: 2000,
        color: '#3B82F6',
        icon: 'Plane',
      };
      const mockCreated = { id: 'goal-1', ...goalData, currentAmount: 0, userId: 'user-1' };
      prismaMock.goal.create.mockResolvedValue(mockCreated);

      const result = await createGoal('user-1', goalData);

      expect(result).toEqual(mockCreated);
      expect(prismaMock.goal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Vacation',
          targetAmount: 2000,
          currentAmount: 0,
          userId: 'user-1',
        }),
      });
    });
  });

  describe('deleteGoal', () => {
    it('should throw error if goal is not found or belongs to another user', async () => {
      prismaMock.goal.findUnique.mockResolvedValue(null);

      await expect(deleteGoal('user-1', 'non-existent')).rejects.toThrow(
        'Goal not found or access denied'
      );
    });

    it('should delete goal successfully when owned by user', async () => {
      const mockGoal = { id: 'goal-1', userId: 'user-1' };
      prismaMock.goal.findUnique.mockResolvedValue(mockGoal);
      prismaMock.goal.delete.mockResolvedValue(mockGoal);

      const result = await deleteGoal('user-1', 'goal-1');

      expect(result).toEqual(mockGoal);
      expect(prismaMock.goal.delete).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
      });
    });
  });

  describe('depositToGoal', () => {
    it('should throw error if goal is not found or belongs to another user', async () => {
      prismaMock.goal.findUnique.mockResolvedValue(null);

      await expect(
        depositToGoal('user-1', 'goal-99', { amount: 100, categoryId: 'cat-1' })
      ).rejects.toThrow('Goal not found or access denied');
    });

    it('should throw error if category does not belong to user or is not found', async () => {
      prismaMock.goal.findUnique.mockResolvedValue({ id: 'goal-1', userId: 'user-1' });
      prismaMock.category.findUnique.mockResolvedValue(null);

      await expect(
        depositToGoal('user-1', 'goal-1', { amount: 100, categoryId: 'cat-99' })
      ).rejects.toThrow('Category not found or access denied');
    });

    it('should throw error if category is of type INCOME', async () => {
      prismaMock.goal.findUnique.mockResolvedValue({ id: 'goal-1', userId: 'user-1' });
      prismaMock.category.findUnique.mockResolvedValue({
        id: 'cat-1',
        userId: 'user-1',
        type: 'INCOME',
      });

      await expect(
        depositToGoal('user-1', 'goal-1', { amount: 100, categoryId: 'cat-1' })
      ).rejects.toThrow('Category must be of type EXPENSE for deposits');
    });

    it('should execute transaction.create and goal.update inside prisma.$transaction', async () => {
      const mockGoal = {
        id: 'goal-1',
        name: 'New Laptop',
        targetAmount: 1500,
        currentAmount: 300,
        userId: 'user-1',
      };
      const mockCategory = {
        id: 'cat-1',
        name: 'Tech Savings',
        type: 'EXPENSE',
        userId: 'user-1',
      };
      const mockCreatedTx = {
        id: 'tx-1',
        amount: 200,
        type: 'EXPENSE',
        goalId: 'goal-1',
        userId: 'user-1',
        categoryId: 'cat-1',
      };
      const mockUpdatedGoal = { ...mockGoal, currentAmount: 500 };

      prismaMock.goal.findUnique.mockResolvedValue(mockGoal);
      prismaMock.category.findUnique.mockResolvedValue(mockCategory);
      prismaMock.transaction.create.mockReturnValue(Promise.resolve(mockCreatedTx));
      prismaMock.goal.update.mockReturnValue(Promise.resolve(mockUpdatedGoal));
      prismaMock.$transaction.mockImplementation(async (promises: any) => Promise.all(promises));

      const result = await depositToGoal('user-1', 'goal-1', {
        amount: 200,
        categoryId: 'cat-1',
        description: 'Monthly laptop deposit',
      });

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 200,
            type: 'EXPENSE',
            userId: 'user-1',
            categoryId: 'cat-1',
            goalId: 'goal-1',
            description: 'Monthly laptop deposit',
          }),
        })
      );
      expect(prismaMock.goal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'goal-1' },
          data: { currentAmount: { increment: 200 } },
        })
      );
      expect(result).toEqual({
        goal: mockUpdatedGoal,
        transaction: mockCreatedTx,
      });
    });
  });
});
