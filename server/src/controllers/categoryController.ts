import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TransactionType } from '@prisma/client';
import * as categoryService from '../services/categoryService';

// Zod schemas for validation
const querySchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  type: z.nativeEnum(TransactionType),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Color must be a valid hex code"),
  icon: z.string().min(1, "Icon name is required"),
});

const updateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Color must be a valid hex code").optional(),
  icon: z.string().min(1, "Icon name is required").optional(),
});

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
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

    const { type } = queryResult.data;
    const categories = await categoryService.getUserCategories(userId, type);

    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const validationResult = createCategorySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
    }

    const category = await categoryService.createCategory(userId, validationResult.data);
    res.status(201).json({ category });
  } catch (error: any) {
    if (error.message === 'Category with this name and type already exists') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const categoryId = req.params.id as string;

    const validationResult = updateCategorySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
    }

    const category = await categoryService.updateCategory(userId, categoryId, validationResult.data);
    res.status(200).json({ category });
  } catch (error: any) {
    if (error.message === 'Category not found or access denied') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Category with this name and type already exists') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const categoryId = req.params.id as string;

    await categoryService.deleteCategory(userId, categoryId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Cannot delete default categories') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Category not found or access denied') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};
