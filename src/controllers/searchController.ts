import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppError } from '../utility';
import * as profileService from '../services/profileService';
import * as searchService from '../services/searchService';

export const userSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.query;
    if (typeof query !== 'string') {
      return next(new AppError('Invalid query parameter', 400));
    }
    const users = await searchService.getProfileByUsername(query);
    res.status(200).json({
      status: 'success',
      Length: users.length,
      data: { users },
    });
  }
);

export const groupSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.query;
    if (typeof query !== 'string') {
      return next(new AppError('Invalid query parameter', 400));
    }
    const groups = await searchService.getGroupByGroupName(query);
    res.status(200).json({
      status: 'success',
      Length: groups.length,
      data: { groups },
    });
  }
);

export const channelSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.query;
    if (typeof query !== 'string') {
      return next(new AppError('Invalid query parameter', 400));
    }
    const channels = await searchService.getChannelByChannelName(query);
    res.status(200).json({
      status: 'success',
      Length: channels.length,
      data: { channels },
    });
  }
);
