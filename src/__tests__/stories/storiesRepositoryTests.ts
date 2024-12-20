import { prisma } from '../../prisma/client';

import {
  createStory,
  findStoryById,
  addUserView,
  getViewCount,
  findStoriesByUserId,
  deleteStoryById,
  checkStoryExpiry,
  findUserPersonalChats,
  findProfileByIdMinimal,
} from '../../repositories/storiesRepository';

// Mock the Prisma client
jest.mock('../../prisma/client', () => ({
  prisma: {
    stories: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    storyViews: {
      create: jest.fn(),
      count: jest.fn(),
    },
    personalChat: {
      findMany: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
  },
}));
jest.mock('../../server', () => ({
  io: jest.fn(),
}));
describe('storiesController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a story successfully', async () => {
    const userId = 1;
    const content = 'Story content';
    const expiryDate = new Date('2024-12-31');
    const media = 'media_url';
    const mediaType = 'image';
    const color = '#FFFFFF';

    // Mock Prisma create method
    (prisma.stories.create as jest.Mock).mockResolvedValue({
      id: 1,
      userId,
      content,
      expiryDate,
      mediaUrl: media,
      mediaType,
      color,
    });

    const story = await createStory(
      userId,
      content,
      expiryDate,
      media,
      mediaType,
      color
    );

    expect(prisma.stories.create).toHaveBeenCalledWith({
      data: {
        userId,
        content,
        expiryDate,
        mediaUrl: media,
        mediaType,
        color,
      },
    });
    expect(story).toEqual({
      id: 1,
      userId,
      content,
      expiryDate,
      mediaUrl: media,
      mediaType,
      color,
    });
  });

  it('should find a story by id', async () => {
    const storyId = 1;
    const mockStory = {
      id: 1,
      userId: 1,
      content: 'Story content',
      mediaUrl: 'media_url',
      createdAt: new Date(),
      expiryDate: new Date('2024-12-31'),
      mediaType: 'image',
      color: '#FFFFFF',
    };

    // Mock Prisma findUnique method
    (prisma.stories.findUnique as jest.Mock).mockResolvedValue(mockStory);

    const story = await findStoryById(storyId);

    expect(prisma.stories.findUnique).toHaveBeenCalledWith({
      where: { id: storyId },
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
    expect(story).toEqual(mockStory);
  });

  it('should add a user view to a story', async () => {
    const storyId = 1;
    const userId = 1;

    // Mock Prisma storyViews.create method
    (prisma.storyViews.create as jest.Mock).mockResolvedValue({
      storyId,
      userId,
    });

    const view = await addUserView(storyId, userId);

    expect(prisma.storyViews.create).toHaveBeenCalledWith({
      data: {
        storyId,
        userId,
      },
    });
    expect(view).toEqual({ storyId, userId });
  });

  it('should count views for a story', async () => {
    const storyId = 1;

    // Mock Prisma count method
    (prisma.storyViews.count as jest.Mock).mockResolvedValue(5);

    const viewCount = await getViewCount(storyId);

    expect(prisma.storyViews.count).toHaveBeenCalledWith({
      where: { storyId },
    });
    expect(viewCount).toBe(5);
  });

  it('should find stories by userId', async () => {
    const userId = 1;
    const mockStories = [
      {
        id: 1,
        userId,
        content: 'Story content 1',
        mediaUrl: 'media_url_1',
        createdAt: new Date(),
        expiryDate: new Date('2024-12-31'),
        mediaType: 'image',
        color: '#FFFFFF',
      },
      {
        id: 2,
        userId,
        content: 'Story content 2',
        mediaUrl: 'media_url_2',
        createdAt: new Date(),
        expiryDate: new Date('2024-12-31'),
        mediaType: 'image',
        color: '#FFFFFF',
      },
    ];

    // Mock Prisma findMany method
    (prisma.stories.findMany as jest.Mock).mockResolvedValue(mockStories);

    const stories = await findStoriesByUserId(userId);

    expect(prisma.stories.findMany).toHaveBeenCalledWith({
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
    expect(stories).toEqual(mockStories);
  });

  it('should delete a story by id', async () => {
    const storyId = 1;

    // Mock Prisma update method
    (prisma.stories.update as jest.Mock).mockResolvedValue({
      id: storyId,
      status: false,
    });

    await deleteStoryById(storyId);

    expect(prisma.stories.update).toHaveBeenCalledWith({
      where: { id: storyId },
      data: { status: false },
    });
  });

  it('should check story expiry', async () => {
    const expiredStory = {
      id: 1,
      expiryDate: new Date('2020-01-01'),
    };

    // Mock Prisma update method
    (prisma.stories.update as jest.Mock).mockResolvedValue({
      id: expiredStory.id,
      status: false,
    });

    const result = await checkStoryExpiry(expiredStory);

    expect(prisma.stories.update).toHaveBeenCalledWith({
      where: { id: expiredStory.id },
      data: { status: false },
    });
    expect(result).toBe(false);
  });

  it('should find user personal chats', async () => {
    const userId = 1;
    const mockChats = [
      { id: 1, user1Id: userId, user2Id: 2 },
      { id: 2, user1Id: userId, user2Id: 3 },
    ];

    // Mock Prisma findMany method
    (prisma.personalChat.findMany as jest.Mock).mockResolvedValue(mockChats);

    const chats = await findUserPersonalChats(userId);

    expect(prisma.personalChat.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });
    expect(chats).toEqual([
      { chatId: 1, otherUserId: 2 },
      { chatId: 2, otherUserId: 3 },
    ]);
  });

  it('should find profile by id minimally', async () => {
    const userId = 1;
    const mockProfile = {
      username: 'john_doe',
      screenName: 'John Doe',
      photo: 'photo_url',
      profilePicVisibility: true,
      storyVisibility: true,
    };

    // Mock Prisma findUnique method
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockProfile);

    const profile = await findProfileByIdMinimal(userId);

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        username: true,
        screenName: true,
        photo: true,
        profilePicVisibility: true,
        storyVisibility: true,
      },
    });
    expect(profile).toEqual(mockProfile);
  });
});
