import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMonthlySummary, getCategoryBreakdown } from '../../src/services/analyticsService';
import { PrismaClient, TransactionType } from '@prisma/client';

vi.mock('@prisma/client', () => {
  const mPrismaClient = {
    transaction: {
      groupBy: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
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

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMonthlySummary', () => {
    it('should calculate correct totalIncome, totalExpense, and balance for a month with data', async () => {
      // Arrange
      prismaMock.transaction.groupBy.mockResolvedValue([
        { type: 'INCOME', _sum: { amount: 3500.5 } },
        { type: 'EXPENSE', _sum: { amount: 1200.25 } },
      ]);

      // Act
      const result = await getMonthlySummary('user-1', 7, 2026);

      // Assert
      expect(result).toEqual({
        totalIncome: 3500.5,
        totalExpense: 1200.25,
        balance: 2300.25,
      });

      expect(prismaMock.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['type'],
          where: expect.objectContaining({
            userId: 'user-1',
            date: {
              gte: new Date(2026, 6, 1),
              lt: new Date(2026, 7, 1),
            },
          }),
        })
      );
    });

    it('should return 0.00 for income, expense, and balance when month has no transactions', async () => {
      // Arrange
      prismaMock.transaction.groupBy.mockResolvedValue([]);

      // Act
      const result = await getMonthlySummary('user-1', 1, 2026);

      // Assert
      expect(result).toEqual({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
      });
      expect(result.totalIncome).not.toBeNull();
      expect(result.totalExpense).not.toBeUndefined();
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should compute category percentage shares and order array descending by totalAmount', async () => {
      // Arrange
      const mockCategoryGroups = [
        { categoryId: 'cat-food', _sum: { amount: 300 } },
        { categoryId: 'cat-rent', _sum: { amount: 700 } },
      ];
      prismaMock.transaction.groupBy.mockResolvedValue(mockCategoryGroups);

      const mockCategories = [
        { id: 'cat-food', name: 'Food', color: '#EF4444', icon: 'Utensils' },
        { id: 'cat-rent', name: 'Rent', color: '#3B82F6', icon: 'Home' },
      ];
      prismaMock.category.findMany.mockResolvedValue(mockCategories);

      // Act
      const breakdown = await getCategoryBreakdown('user-1', 7, 2026, TransactionType.EXPENSE);

      // Assert
      expect(breakdown).toHaveLength(2);
      // Order descending by totalAmount (Rent 700 first, Food 300 second)
      expect(breakdown[0]).toEqual({
        categoryId: 'cat-rent',
        name: 'Rent',
        color: '#3B82F6',
        icon: 'Home',
        totalAmount: 700,
        percentage: 70,
      });
      expect(breakdown[1]).toEqual({
        categoryId: 'cat-food',
        name: 'Food',
        color: '#EF4444',
        icon: 'Utensils',
        totalAmount: 300,
        percentage: 30,
      });
    });

    it('should handle zero expenses safely without division by zero errors', async () => {
      // Arrange
      prismaMock.transaction.groupBy.mockResolvedValue([]);

      // Act
      const breakdown = await getCategoryBreakdown('user-1', 7, 2026, TransactionType.EXPENSE);

      // Assert
      expect(breakdown).toEqual([]);
    });

    it('should return 0 percentage when sum of category amounts is 0', async () => {
      // Arrange
      prismaMock.transaction.groupBy.mockResolvedValue([
        { categoryId: 'cat-empty', _sum: { amount: 0 } },
      ]);
      prismaMock.category.findMany.mockResolvedValue([
        { id: 'cat-empty', name: 'Misc', color: '#000000', icon: 'Folder' },
      ]);

      // Act
      const breakdown = await getCategoryBreakdown('user-1', 7, 2026, TransactionType.EXPENSE);

      // Assert
      expect(breakdown).toHaveLength(1);
      expect(breakdown[0].percentage).toBe(0);
      expect(Number.isNaN(breakdown[0].percentage)).toBe(false);
    });
  });
});
