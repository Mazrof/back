import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppError } from '../utility';
import { prisma } from '../prisma/client';

exports.addStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, content, storyMedia } = req.body;
    console.log(userId);
    console.log(content);
    console.log(storyMedia);

    //TODO make it use token
    if (!userId || !content) {
      return res.status(400).json({
        status: 'fail',
        message: 'User ID and content are required.',
      });
    }

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    const newStory = await prisma.stories.create({
      data: {
        userId,
        content,
        expiryDate,
      },
    });
    // Respond with the created story
    res.status(201).json({
      status: 'success',
      data: {
        story: newStory,
      },
    });
  }
);
exports.getStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const story = await prisma.stories.findUnique({
      where: { id: Number(id) },
    });

    if (!story) {
      return next(new AppError('Story not found', 404));
    }

    // Respond with the requested story
    res.status(200).json({
      status: 'success',
      data: {
        story,
      },
    });
  }
);

exports.getAllUserStories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.query;

    const stories = await prisma.stories.findMany({
      where: { userId: Number(userId) },
    });

    res.status(200).json({
      status: 'success',
      data: {
        stories,
      },
    });
  }
);

exports.deleteStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deletedStory = await prisma.stories.delete({
      where: { id: Number(id) },
    });

    // Respond with the deleted story confirmation
    res.status(204).json({
      status: 'success',
      message: 'Story deleted successfully',
      data: {
        story: deletedStory,
      },
    });
  }
);
