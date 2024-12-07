import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';
import logger from './logger';
import { MySocket, NewMessages } from '../sockets/listeners/chatListeners';

export const catchAsync = (
  fn: (arg0: Request, arg1: Response, arg2: NextFunction) => any
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await fn(req, res, next).catch(next);
  };
};
export const catchSocketError = (fn: any) => {
  return async (
    socket: MySocket,
    callback?: (arg: object) => void,
    data?: any
  ) => {
    try {
      await fn(socket, callback, data);
    } catch (e) {
      if (callback) callback(e);
      console.log(e);
      logger.error(e);
    }
  };
};
