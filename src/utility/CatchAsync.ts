import { Request, Response, NextFunction } from 'express';

export const catchAsync = (
  fn: (arg0: Request, arg1: Response, arg2: NextFunction) => any
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await fn(req, res, next).catch(next);
  };
};
