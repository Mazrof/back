import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppError } from '../utility';
import * as profileService from '../services/profileService';
import * as searchService from '../services/searchService';

export const generalSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.query;
    if (typeof query !== 'string') {
      return next(new AppError('Invalid query parameter', 400));
    }
    if (query.length === 0) {
      res.status(200).json({
        status: 'success',
        data: {},
      });
    }
    const channels = await searchService.getChannelByChannelName(query);
    const users = await searchService.getProfileByUsername(query);
    const groups = await searchService.getGroupByGroupName(query);
    res.status(200).json({
      status: 'success',
      data: { users, channels, groups },
    });
  }
);
