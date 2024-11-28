import { Request, Response, NextFunction, query } from 'express';
import { AppError, catchAsync } from '../utility';
import * as userService from '../services/userService';

export const AddToBlockList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.blockerID || req.params.blockedID) {
      throw new AppError('Invalid request format', 400);
    }
    const blockerId = Number(req.query.blockerID);
    const blockedId = Number(req.params.id);
    await userService.AddToBlocked(blockerId, blockedId);
    res.status(200).json({
      status: 'success',
    });
  }
);

export const RemoveFromBlocked = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.blockerID || req.params.blockedID) {
      throw new AppError('Invalid request format', 400);
    }
    console.log(req.query.blockerID);
    const blockerId = Number(req.query.blockerID);
    const blockedId = Number(req.params.id);
    await userService.RemoveFromBlocked(blockerId, blockedId);
    res.status(200).json({
      status: 'success',
    });
  }
);

export const GetBlockList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.blockerID) {
      throw new AppError('Invalid request format', 400);
    }
    const blockerId = Number(req.query.blockerID);
    const blockList = await userService.GetUserBlockedList(blockerId);
    res.status(200).json({
      status: 'success',
      data: {
        blockList,
      },
    });
  }
);
