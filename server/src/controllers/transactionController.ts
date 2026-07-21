import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TransactionType } from '@prisma/client';
import * as transactionService from '../services/transactionService';

// Zod schemas for validation
const querySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  type: z.nativeEnum(TransactionType).optional(),
}).refine(data => {
  // If month is provided, year must also be provided, and vice versa
  if ((data.month && !data.year) || (!data.month && data.year)) {
    return false;
  }
  return true;
}, {
  message: "Both month and year must be provided together",
  path: ["month", "year"]
});

const createTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.nativeEnum(TransactionType),
  categoryId: z.string().uuid("Invalid category ID"),
  description: z.string().optional(),
  date: z.string().datetime("Invalid date format (must be ISO 8601)").or(z.date()),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  description: z.string().optional(),
  date: z.string().datetime("Invalid date format (must be ISO 8601)").or(z.date()).optional(),
});

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    // Parse query params
    const queryResult = querySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: queryResult.error.issues,
      });
    }

    const params = queryResult.data;
    const transactions = await transactionService.getTransactions(userId, params);

    res.status(200).json({ transactions });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const validationResult = createTransactionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
    }

    const transaction = await transactionService.createTransaction(userId, validationResult.data);
    res.status(201).json({ transaction });
  } catch (error: any) {
    if (error.message === 'Category not found or access denied') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Transaction type does not match category type') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const transactionId = req.params.id as string;

    const validationResult = updateTransactionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
    }

    const transaction = await transactionService.updateTransaction(userId, transactionId, validationResult.data);
    res.status(200).json({ transaction });
  } catch (error: any) {
    if (error.message === 'Transaction not found or access denied') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Category not found or access denied') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Transaction type does not match category type') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const transactionId = req.params.id as string;

    await transactionService.deleteTransaction(userId, transactionId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Transaction not found or access denied') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};
