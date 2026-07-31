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
    category: {
      findUnique: vi.fn(),
    },
    goal: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

describe('Goals API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/goals', () => {
    it('should return 401 Unauthorized if no token is provided', async () => {
      const response = await request(app).get('/api/v1/goals');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 200 OK with list of goals for authenticated user', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const mockGoals = [
        { id: 'goal-1', name: 'Vacation', targetAmount: 1000, currentAmount: 200, userId: 'user-1' },
      ];
      prismaMock.goal.findMany.mockResolvedValue(mockGoals);

      const response = await request(app)
        .get('/api/v1/goals')
        .set('Cookie', ['token=valid_token']);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ goals: mockGoals });
    });
  });

  describe('POST /api/v1/goals', () => {
    it('should return 400 Bad Request if validation fails', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const response = await request(app)
        .post('/api/v1/goals')
        .set('Cookie', ['token=valid_token'])
        .send({
          name: 'A', // invalid: min 2 chars
          targetAmount: -50, // invalid: positive number required
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should create goal successfully with valid Zod payload', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const validPayload = {
        name: 'Emergency Fund',
        targetAmount: 5000,
        color: '#10B981',
        icon: 'ShieldCheck',
      };

      const mockCreated = {
        id: 'goal-1',
        ...validPayload,
        currentAmount: 0,
        userId: 'user-1',
        createdAt: new Date().toISOString(),
      };
      prismaMock.goal.create.mockResolvedValue(mockCreated);

      const response = await request(app)
        .post('/api/v1/goals')
        .set('Cookie', ['token=valid_token'])
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ goal: mockCreated });
    });
  });

  describe('POST /api/v1/goals/:id/deposit', () => {
    it('should return 200 OK and updated goal and transaction on valid parameters', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const categoryId = 'd9b2d63d-a233-4123-8478-36e6515b0e68';
      const mockGoal = { id: 'goal-1', name: 'Car Fund', targetAmount: 10000, currentAmount: 1000, userId: 'user-1' };
      const mockCategory = { id: categoryId, name: 'Savings', type: 'EXPENSE', userId: 'user-1' };

      prismaMock.goal.findUnique.mockResolvedValue(mockGoal);
      prismaMock.category.findUnique.mockResolvedValue(mockCategory);

      const mockCreatedTx = { id: 'tx-1', amount: 500, type: 'EXPENSE', categoryId, goalId: 'goal-1' };
      const mockUpdatedGoal = { ...mockGoal, currentAmount: 1500 };

      prismaMock.transaction.create.mockReturnValue(Promise.resolve(mockCreatedTx));
      prismaMock.goal.update.mockReturnValue(Promise.resolve(mockUpdatedGoal));
      prismaMock.$transaction.mockImplementation(async (promises: any) => Promise.all(promises));

      const response = await request(app)
        .post('/api/v1/goals/goal-1/deposit')
        .set('Cookie', ['token=valid_token'])
        .send({
          amount: 500,
          categoryId,
          description: 'Monthly deposit for car',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        goal: mockUpdatedGoal,
        transaction: mockCreatedTx,
      });
    });

    it('should return 400 Bad Request when amount is negative', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const response = await request(app)
        .post('/api/v1/goals/goal-1/deposit')
        .set('Cookie', ['token=valid_token'])
        .send({
          amount: -100,
          categoryId: 'd9b2d63d-a233-4123-8478-36e6515b0e68',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 Bad Request when amount is a string', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const response = await request(app)
        .post('/api/v1/goals/goal-1/deposit')
        .set('Cookie', ['token=valid_token'])
        .send({
          amount: 'one hundred',
          categoryId: 'd9b2d63d-a233-4123-8478-36e6515b0e68',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('DELETE /api/v1/goals/:id', () => {
    it('should return 204 No Content on successful deletion', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const mockGoal = { id: 'goal-1', userId: 'user-1' };
      prismaMock.goal.findUnique.mockResolvedValue(mockGoal);
      prismaMock.goal.delete.mockResolvedValue(mockGoal);

      const response = await request(app)
        .delete('/api/v1/goals/goal-1')
        .set('Cookie', ['token=valid_token']);

      expect(response.status).toBe(204);
    });
  });
});
