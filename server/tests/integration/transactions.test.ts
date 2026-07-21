import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import * as jwt from '../../src/utils/jwt';

// Mock Prisma
vi.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
      findMany: vi.fn(),
    }
  };
  return {
    PrismaClient: vi.fn().mockImplementation(function() { return mPrismaClient; }),
    TransactionType: {
      INCOME: 'INCOME',
      EXPENSE: 'EXPENSE'
    },
    Currency: {
      PLN: 'PLN',
      EUR: 'EUR',
      USD: 'USD'
    }
  };
});

const prismaMock = new (PrismaClient as any)();

// Mock jwt
vi.mock('../../src/utils/jwt', () => ({
  verifyToken: vi.fn(),
  generateToken: vi.fn(),
}));

describe('Transactions API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/transactions', () => {
    it('should return 401 Unauthorized if no token is provided', async () => {
      const response = await request(app).get('/api/v1/transactions');
      
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if token is invalid', async () => {
      // Arrange
      (jwt.verifyToken as any).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const response = await request(app)
        .get('/api/v1/transactions')
        .set('Cookie', ['token=invalid_token']);
      
      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/transactions', () => {
    it('should return 400 Bad Request if required fields are omitted', async () => {
      // We mock auth to succeed so it hits the controller
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user1' });

      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', ['token=valid_token'])
        .send({
          // Missing amount, type, categoryId, date
          description: 'Test'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
      
      // Check if zod errors for required fields are present
      const errorPaths = response.body.details.map((err: any) => err.path[0]);
      expect(errorPaths).toContain('amount');
      expect(errorPaths).toContain('type');
      expect(errorPaths).toContain('categoryId');
      expect(errorPaths).toContain('date');
    });

    it('should return 400 Bad Request if amount is negative', async () => {
      (jwt.verifyToken as any).mockReturnValue({ userId: 'user1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user1' });

      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', ['token=valid_token'])
        .send({
          amount: -50, // Invalid
          type: 'EXPENSE',
          categoryId: 'd9b2d63d-a233-4123-8478-36e6515b0e68', // Valid UUID
          date: new Date().toISOString()
        });
      
      expect(response.status).toBe(400);
      expect(response.body.details[0].message).toContain('Amount must be positive');
    });
  });
});
