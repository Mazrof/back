import { prisma } from '../prisma/client';
import { use } from 'passport';

export const createStory = async (userId, content, expiryDate, media) => {
  try {
    const story = await prisma.stories.create({
      data: {
        userId,
        content,
        expiryDate,
        mediaUrl: media,
      },
    });
  } catch (error) {
    console.error('Error creating story:', error);
    throw new Error('Failed to create story');
  }
};

export const findStoryById = async (id: number) => {
  return prisma.stories.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      content: true,
      mediaUrl: true,
      createdAt: true,
      expiryDate: true,
    },
  });
};

export const addUserView = async (storyId: number, userId: number) => {
  try {
    return await prisma.storyViews.create({
      data: {
        storyId: storyId,
        userId: userId,
      },
    });
  } catch (error) {
    // Check if the error is a unique constraint violation
    if (error.code === 'P2002') {
      return;
    }
    throw error;
  }
};

export const getViewCount = async (storyId: number) => {
  return prisma.storyViews.count({
    where: { storyId },
  });
};
export const findStoriesByUserId = async (userId: number) => {
  return prisma.stories.findMany({
    where: {
      status: true,
      userId,
    },
    select: {
      id: true,
      userId: true,
      content: true,
      mediaUrl: true,
      createdAt: true,
      expiryDate: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

export const deleteStoryById = async (id: number) => {
  await prisma.stories.update({
    where: { id },
    data: { status: false },
  });
};

export const checkStoryExpiry = async (story) => {
  if (story.expiryDate && new Date() > new Date(story.expiryDate)) {
    await prisma.stories.update({
      where: { id: story.id },
      data: { status: false },
    });
    return false;
  }
  return true;
};
