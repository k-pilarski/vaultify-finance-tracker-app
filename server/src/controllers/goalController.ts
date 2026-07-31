import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as goalService from '../services/goalService';

const createGoalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  targetAmount: z.number().positive('Target amount must be positive'),
  deadline: z.string().datetime('Invalid date format (must be ISO 8601)').or(z.date()).optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color hex format'),
  icon: z.string().min(1, 'Icon is required'),
});

export const getGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const goals = await goalService.getGoals(userId);
    res.status(200).json({ goals });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const validationResult = createGoalSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
    }

    const goal = await goalService.createGoal(userId, validationResult.data);
    res.status(201).json({ goal });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id as string;

    await goalService.deleteGoal(userId, goalId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Goal not found or access denied') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};
