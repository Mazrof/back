import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppError } from '../utility';
import * as storiesService from '../services/storiesService';

export const addStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, content, storyMedia } = req.body;
    if (!userId || !content) {
      return res.status(400).json({
        status: 'fail',
        message: 'User ID and content are required.',
      });
    }
    await storiesService.createStory(userId, content, storyMedia);
    res.status(201).json({
      status: 'success',
    });
  }
);

export const getStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const curUserId = req.body.userId;
    const story = await storiesService.getStoryById(
      Number(id),
      Number(curUserId)
    );

    if (!story) {
      return next(new AppError('Story not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        story,
      },
    });
  }
);

export const getAllUserStories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.query;
    const curUserId = req.body.userId;
    const stories = await storiesService.getUserStories(
      Number(userId),
      Number(curUserId)
    );

    res.status(200).json({
      status: 'success',
      data: {
        stories,
      },
    });
  }
);

export const deleteStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await storiesService.deleteStoryById(Number(id));

    res.status(204).json({
      status: 'success',
      message: 'Story deleted successfully',
    });
  }
);
