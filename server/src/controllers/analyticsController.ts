import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TransactionType } from '@prisma/client';
import * as analyticsService from '../services/analyticsService';

const summaryQuerySchema = z.object({
  month: z.coerce
    .number()
    .int('Month must be an integer')
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12'),
  year: z.coerce
    .number()
    .int('Year must be an integer')
    .min(2000, 'Year must be between 2000 and 2100')
    .max(2100, 'Year must be between 2000 and 2100'),
});

const categoryBreakdownQuerySchema = z.object({
  month: z.coerce
    .number()
    .int('Month must be an integer')
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12'),
  year: z.coerce
    .number()
    .int('Year must be an integer')
    .min(2000, 'Year must be between 2000 and 2100')
    .max(2100, 'Year must be between 2000 and 2100'),
  type: z.nativeEnum(TransactionType).optional().default(TransactionType.EXPENSE),
});

export const getMonthlySummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const validationResult = summaryQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    const { month, year } = validationResult.data;
    const summary = await analyticsService.getMonthlySummary(userId, month, year);

    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

export const getCategoryBreakdown = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const validationResult = categoryBreakdownQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    const { month, year, type } = validationResult.data;
    const breakdown = await analyticsService.getCategoryBreakdown(userId, month, year, type);

    res.status(200).json(breakdown);
  } catch (error) {
    next(error);
  }
};
