import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import { AppError } from '../types/appError';
import { prisma } from '../prisma/client';

exports.addStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

exports.getStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

exports.getAllUserStories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

exports.deleteStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
