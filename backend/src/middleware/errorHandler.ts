import type { Request, Response, NextFunction } from 'express'

interface AppError extends Error {
  status?: number
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void {
  console.error(err)
  res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' })
}
