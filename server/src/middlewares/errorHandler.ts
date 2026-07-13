import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiErrorResponse } from '../types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const response: ApiErrorResponse = {
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: err.format(),
    };
    return res.status(400).json(response);
  }

  const statusCode = (err as any).statusCode || 500;
  const response: ApiErrorResponse = {
    status: 'error',
    code: (err as any).code || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  };

  return res.status(statusCode).json(response);
};
