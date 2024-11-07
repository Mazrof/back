import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';
import logger from './logger';

export const catchAsync = (
  fn: (arg0: Request, arg1: Response, arg2: NextFunction) => any
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await fn(req, res, next).catch(next);
  };
};
//{ [key: string]: string | number | boolean }
export const catchAsyncSockets = (
  fn: (...args: any[]) => void,
  socket: Socket
) => {
  return async (...args: any[]) => {
    Promise.resolve(fn(...args)).catch((error) => {
      logger.error('Error in event handler:', error);
      socket.emit('errorEvent', { message: error.message });
    });
  };
};
