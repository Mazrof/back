import * as storiesService from '../../services/storiesService';
import * as storiesRepository from '../../repositories/storiesRepository';
import { AppError } from '../../utility';

jest.mock('../../repositories/storiesRepository');
jest.mock('../../server', () => ({
  io: jest.fn(),
}));

describe('Stories Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStory', () => {
    it('should create a story with the correct parameters', async () => {
      const mockData = {
        userId: 1,
        content: 'Story content',
        storyMedia: 'mediaUrl',
        mediaType: 'image',
        color: 'red',
      };
      const mockExpiryDate = new Date();
      mockExpiryDate.setHours(mockExpiryDate.getHours() + 24);

      (storiesRepository.createStory as jest.Mock).mockResolvedValue({
        ...mockData,
        expiryDate: mockExpiryDate,
      });

      const result = await storiesService.createStory(
        mockData.userId,
        mockData.content,
        mockData.storyMedia,
        mockData.mediaType,
        mockData.color
      );

      expect(storiesRepository.createStory).toHaveBeenCalledWith(
        mockData.userId,
        mockData.content,
        expect.any(Date), // Expiry date is dynamic
        mockData.storyMedia,
        mockData.mediaType,
        mockData.color
      );
      expect(result).toEqual({
        ...mockData,
        expiryDate: mockExpiryDate,
      });
    });
  });

  describe('getStoryById', () => {
    it('should return null if story does not exist', async () => {
      const storyId = 1;
      const userId = 1;

      (storiesRepository.findStoryById as jest.Mock).mockResolvedValue(null);

      const result = await storiesService.getStoryById(storyId, userId);

      expect(result).toBeNull();
      expect(storiesRepository.findStoryById).toHaveBeenCalledWith(storyId);
    });

    it('should return null if story is expired', async () => {
      const storyId = 1;
      const userId = 1;
      const mockStory = { id: 1, mediaUrl: 'url', expiryDate: new Date(0) };

      (storiesRepository.findStoryById as jest.Mock).mockResolvedValue(
        mockStory
      );
      (storiesRepository.checkStoryExpiry as jest.Mock).mockResolvedValue(
        false
      );

      const result = await storiesService.getStoryById(storyId, userId);

      expect(result).toBeNull();
      expect(storiesRepository.checkStoryExpiry).toHaveBeenCalledWith(
        mockStory
      );
    });

    it('should return story with updated view count and media URL', async () => {
      const storyId = 1;
      const userId = 1;
      const mockStory = {
        id: 1,
        mediaUrl: 'mediaUrl',
        expiryDate: new Date(),
        viewCount: 0,
      };

      (storiesRepository.findStoryById as jest.Mock).mockResolvedValue(
        mockStory
      );
      (storiesRepository.checkStoryExpiry as jest.Mock).mockResolvedValue(true);
      (storiesRepository.addUserView as jest.Mock).mockResolvedValue(true);
      (storiesRepository.getViewCount as jest.Mock).mockResolvedValue(1);

      const result = await storiesService.getStoryById(storyId, userId);

      expect(storiesRepository.addUserView).toHaveBeenCalledWith(
        storyId,
        userId
      );
      expect(storiesRepository.getViewCount).toHaveBeenCalledWith(storyId);
      expect(result).toEqual({
        ...mockStory,
        viewCount: 1,
      });
    });
  });

  describe('getUserStories', () => {
    it('should return empty list if no user chats are found', async () => {
      const userId = 1;

      (storiesRepository.findUserPersonalChats as jest.Mock).mockResolvedValue(
        []
      );

      const result = await storiesService.getUserStories(userId);

      expect(result).toEqual([]);
      expect(storiesRepository.findUserPersonalChats).toHaveBeenCalledWith(
        userId
      );
    });

    it('should return all stories for a user with updated view counts', async () => {
      const userId = 1;
      const mockUserChats = [{ chatId: 1, otherUserId: 2 }];
      const mockUserData = { id: 2, name: 'John Doe' };
      const mockStories = [
        { id: 1, mediaUrl: 'mediaUrl', viewCount: 0, expiryDate: new Date() },
      ];

      (storiesRepository.findUserPersonalChats as jest.Mock).mockResolvedValue(
        mockUserChats
      );
      (storiesRepository.findProfileByIdMinimal as jest.Mock).mockResolvedValue(
        mockUserData
      );
      (storiesRepository.findStoriesByUserId as jest.Mock).mockResolvedValue(
        mockStories
      );
      (storiesRepository.checkStoryExpiry as jest.Mock).mockResolvedValue(true);
      (storiesRepository.addUserView as jest.Mock).mockResolvedValue(true);
      (storiesRepository.getViewCount as jest.Mock).mockResolvedValue(1);

      const result = await storiesService.getUserStories(userId);

      expect(result).toEqual([
        {
          ...mockUserData,
          stories: [
            {
              ...mockStories[0],
              StoryMedia: mockStories[0].mediaUrl,
              viewCount: 1,
            },
          ],
        },
        {
          ...mockUserData,
          stories: [
            {
              ...mockStories[0],
              StoryMedia: mockStories[0].mediaUrl,
              viewCount: 1,
            },
          ],
        },
      ]);
    });
  });

  describe('deleteStoryById', () => {
    it('should delete a story by id', async () => {
      const storyId = 1;

      (storiesRepository.deleteStoryById as jest.Mock).mockResolvedValue(true);

      const result = await storiesService.deleteStoryById(storyId);

      expect(storiesRepository.deleteStoryById).toHaveBeenCalledWith(storyId);
      expect(result).toBe(true);
    });
  });
});
