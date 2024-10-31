import { NextFunction } from 'express';

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
import { writeFile } from 'fs/promises';

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
