import type { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: any;
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendError(res: Response, error: string, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error,
  });
}
