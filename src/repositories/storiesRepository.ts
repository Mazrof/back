import { prisma } from '../prisma/client';

export const createStory = async (
  userId,
  content,
  expiryDate,
  media,
  mediaType,
  color
) => {
  try {
    const story = await prisma.stories.create({
      data: {
        userId,
        content,
        expiryDate,
        mediaUrl: media,
        mediaType,
        color,
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
      mediaType: true,
      color: true,
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
      return null; // -------------------------------------edited for push
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
      mediaType: true,
      color: true,
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

export const findUserPersonalChats = async (userId: number) => {
  const chats = await prisma.personalChat.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
  });
  return chats.map((chat) => ({
    chatId: chat.id,
    otherUserId: chat.user1Id === userId ? chat.user2Id : chat.user1Id,
  }));
};

export const findProfileByIdMinimal = async (id: number) => {
  return prisma.users.findUnique({
    where: { id },
    select: {
      username: true,
      screenName: true,
      photo: true,
      profilePicVisibility: true,
      storyVisibility: true,
    },
  });
};