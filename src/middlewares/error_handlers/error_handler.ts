import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utility';
import logger from '../../utility/logger';
import { z } from 'zod';

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: err.status,
      stack: err.stack,
      error: err,
    });
  }
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        message: err.message,
        status: err.status,
      });
    }
    logger.error('Error 💣️💣️💣️', err);
    return res.status(500).json({
      message: 'Something went wrong',
      status: 'error',
    });
  }
};

const hanldeZodErrors = (err: z.ZodError,req:Request,res:Response) => {
  const formattedErrors = err.errors.map((error) => ({
    field: error.path.join('.'),
    message: error.message,
  }));

  return res.status(422).json({
    status: 'fail',
    message: 'Validation failed',
    errors: formattedErrors,
  });
}

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info(`Error handled: ${err.message}`);
  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    hanldeZodErrors(err,req,res);
  }

  // Handle other application errors
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, req, res);
  }
};
