import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import { AppError } from '../types/appError';
import { profileController } from './profileController';

export const generalSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query.query as string;
    const type = req.query.type as string;

    // Validate the type parameter
    if (!type) {
      return next(new AppError('Search type is required', 400));
    }

    // Validate the query parameter
    if (!query) {
      return next(new AppError('Search query is required', 400));
    }

    // Handle user search
    if (type === 'user') {
      try {
        const users = await profileController.getProfileByUserName(query);

        return res.status(200).json({
          status: 'success',
          length: users.length,
          data: { users },
        });
      } catch (error) {
        return next(new AppError('Error during user search', 500));
      }
    } else {
      return next(new AppError('Invalid search type', 400));
    }
  }
);
