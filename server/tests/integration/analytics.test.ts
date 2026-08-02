import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import * as jwt from '../../src/utils/jwt';

vi.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: vi.fn(),
    },
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
    Currency: {
      PLN: 'PLN',
      EUR: 'EUR',
      USD: 'USD',
    },
  };
});

const prismaMock = new (PrismaClient as any)();

vi.mock('../../src/utils/jwt', () => ({
  verifyToken: vi.fn(),
  generateToken: vi.fn(),
}));

describe('Analytics API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/analytics/summary', () => {
    it('should return 401 Unauthorized if no cookie token is provided', async () => {
      const response = await request(app).get('/api/v1/analytics/summary?month=7&year=2026');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 Bad Request if month or year parameter is missing', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const response = await request(app)
        .get('/api/v1/analytics/summary?month=7') // missing year
        .set('Cookie', ['token=valid_token']);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 Bad Request if month parameter is out of bounds', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const response = await request(app)
        .get('/api/v1/analytics/summary?month=13&year=2026') // month 13 invalid
        .set('Cookie', ['token=valid_token']);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 200 OK with aggregated financial summary for requested month', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      prismaMock.transaction.groupBy.mockResolvedValue([
        { type: 'INCOME', _sum: { amount: 5000 } },
        { type: 'EXPENSE', _sum: { amount: 1500 } },
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/summary?month=7&year=2026')
        .set('Cookie', ['token=valid_token']);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalIncome: 5000,
        totalExpense: 1500,
        balance: 3500,
      });
    });
  });

  describe('GET /api/v1/analytics/by-category', () => {
    it('should return 401 Unauthorized if token is missing', async () => {
      const response = await request(app).get('/api/v1/analytics/by-category?month=7&year=2026');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 200 OK with category breakdown list ordered by totalAmount', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      prismaMock.transaction.groupBy.mockResolvedValue([
        { categoryId: 'cat-1', _sum: { amount: 200 } },
        { categoryId: 'cat-2', _sum: { amount: 800 } },
      ]);

      prismaMock.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Coffee', color: '#7C3AED', icon: 'Coffee' },
        { id: 'cat-2', name: 'Housing', color: '#2563EB', icon: 'Home' },
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/by-category?month=7&year=2026&type=EXPENSE')
        .set('Cookie', ['token=valid_token']);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual({
        categoryId: 'cat-2',
        name: 'Housing',
        color: '#2563EB',
        icon: 'Home',
        totalAmount: 800,
        percentage: 80,
      });
      expect(response.body[1]).toEqual({
        categoryId: 'cat-1',
        name: 'Coffee',
        color: '#7C3AED',
        icon: 'Coffee',
        totalAmount: 200,
        percentage: 20,
      });
    });
  });
});
