import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTransactions, createTransaction } from '../../src/services/transactionService';
import { PrismaClient } from '@prisma/client';

vi.mock('@prisma/client', () => {
  const mPrismaClient = {
    transaction: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    }
  };
  return {
    PrismaClient: vi.fn().mockImplementation(function() { return mPrismaClient; }),
    TransactionType: {
      INCOME: 'INCOME',
      EXPENSE: 'EXPENSE'
    }
  };
});

// Access the mocked instance (it's a singleton in the mock definition)
const prismaMock = new PrismaClient() as any;

describe('transactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should throw error if category does not belong to user', async () => {
      // Arrange
      prismaMock.category.findUnique.mockResolvedValue({
        id: 'cat1',
        userId: 'other_user',
        type: 'EXPENSE'
      });

      // Act & Assert
      await expect(createTransaction('user1', {
        amount: 100,
        type: 'EXPENSE',
        categoryId: 'cat1',
        date: new Date().toISOString()
      })).rejects.toThrow('Category not found or access denied');
    });

    it('should throw error if category is not found', async () => {
      // Arrange
      prismaMock.category.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(createTransaction('user1', {
        amount: 100,
        type: 'EXPENSE',
        categoryId: 'cat1',
        date: new Date().toISOString()
      })).rejects.toThrow('Category not found or access denied');
    });

    it('should throw error if transaction type does not match category type', async () => {
      // Arrange
      prismaMock.category.findUnique.mockResolvedValue({
        id: 'cat1',
        userId: 'user1',
        type: 'INCOME' // mismatch
      });

      // Act & Assert
      await expect(createTransaction('user1', {
        amount: 100,
        type: 'EXPENSE', // mismatch
        categoryId: 'cat1',
        date: new Date().toISOString()
      })).rejects.toThrow('Transaction type does not match category type');
    });

    it('should create transaction successfully', async () => {
      // Arrange
      prismaMock.category.findUnique.mockResolvedValue({
        id: 'cat1',
        userId: 'user1',
        type: 'EXPENSE'
      });
      
      const mockResult = { id: 'trans1', amount: 100, categoryId: 'cat1' };
      prismaMock.transaction.create.mockResolvedValue(mockResult);

      // Act
      const result = await createTransaction('user1', {
        amount: 100,
        type: 'EXPENSE',
        categoryId: 'cat1',
        date: new Date('2026-07-20T10:00:00Z').toISOString()
      });

      // Assert
      expect(result).toEqual(mockResult);
      expect(prismaMock.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user1',
          categoryId: 'cat1',
          amount: 100,
          type: 'EXPENSE'
        })
      }));
    });
  });

  describe('getTransactions', () => {
    it('should build correct where clause for month and year', async () => {
      // Arrange
      prismaMock.transaction.findMany.mockResolvedValue([]);

      // Act
      await getTransactions('user1', { month: 7, year: 2026 });

      // Assert
      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user1',
          date: {
            gte: new Date(2026, 6, 1), // month - 1 because JS Date is 0-indexed
            lt: new Date(2026, 7, 1)
          }
        })
      }));
    });

    it('should build correct where clause with category and type', async () => {
      // Arrange
      prismaMock.transaction.findMany.mockResolvedValue([]);

      // Act
      await getTransactions('user1', { type: 'EXPENSE', categoryId: 'cat1' });

      // Assert
      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user1',
          type: 'EXPENSE',
          categoryId: 'cat1'
        })
      }));
    });
  });
});
