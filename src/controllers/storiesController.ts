import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppError } from '../utility';
import * as storiesService from '../services/storiesService';

export const addStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session.user.id;
    const { content, storyMedia, mediaType, color } = req.body;
    if (!userId || !content) {
      return res.status(400).json({
        status: 'fail',
        message: 'User ID and content are required.',
      });
    }
    await storiesService.createStory(
      userId,
      content,
      storyMedia,
      mediaType,
      color
    );
    res.status(201).json({
      status: 'success',
    });
  }
);

export const getStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const curUserId = req.session.user.id;
    const storyId = req.params.id;
    const story = await storiesService.getStoryById(
      Number(storyId),
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
    const userId = req.session.user.id;
    const allFriendsStories = await storiesService.getUserStories(
      Number(userId)
    );

    res.status(200).json({
      status: 'success',
      data: {
        allFriendsStories,
      },
    });
  }
);

export const deleteStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session.user.id;
    await storiesService.deleteStoryById(Number(userId));

    res.status(204).json({
      status: 'success',
      message: 'Story deleted successfully',
    });
  }
);
