import { Request, Response, NextFunction } from 'express';
import * as storiesService from '../../services/storiesService';
import * as storiesController from '../../controllers/storiesController';
import { AppError } from '../../utility';

jest.mock('../../services/storiesService'); // Mock the storiesService module
jest.mock('../../server', () => ({
  io: jest.fn(),
}));

describe('Stories Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockSession = {
    id: 'mock-session-id',
    cookie: {
      originalMaxAge: 3600000,
      expires: new Date(),
      httpOnly: true,
      secure: false,
    },
    regenerate: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn(),
    reload: jest.fn(),
    resetMaxAge: jest.fn(),
    touch: jest.fn(),
    user: {
      id: 1,
      userType: 'admin',
      user: {},
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should add a story successfully', async () => {
    mockRequest = {
      body: {
        content: 'My Story Content',
        storyMedia: 'mediaUrl',
        mediaType: 'image',
        color: 'blue',
      },
      session: mockSession,
    };

    (storiesService.createStory as jest.Mock).mockResolvedValue(true);

    await storiesController.addStory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
    });
  });

  it('should handle missing user ID or content when adding a story', async () => {
    mockRequest = {
      body: { content: '' },
      session: mockSession,
    };

    await storiesController.addStory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'User ID and content are required.',
    });
  });

  it('should fetch a story by ID', async () => {
    mockRequest = { params: { id: '1' }, session: mockSession };
    const story = {
      id: 1,
      content: 'My Story',
      mediaUrl: 'mediaUrl',
      viewCount: 1,
    };
    (storiesService.getStoryById as jest.Mock).mockResolvedValue(story);

    await storiesController.getStory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { story },
    });
  });

  it('should handle error when story is not found by ID', async () => {
    mockRequest = { params: { id: '99' }, session: mockSession };
    (storiesService.getStoryById as jest.Mock).mockResolvedValue(null);

    await storiesController.getStory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(new AppError('Story not found', 404));
  });

  it('should fetch all user stories', async () => {
    mockRequest = { session: mockSession };
    const allUserStories = [
      {
        id: 1,
        name: 'John Doe',
        stories: [
          { id: 1, content: 'My Story', mediaUrl: 'mediaUrl', viewCount: 1 },
        ],
      },
    ];
    (storiesService.getUserStories as jest.Mock).mockResolvedValue(
      allUserStories
    );

    await storiesController.getAllUserStories(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { allFriendsStories: allUserStories },
    });
  });

  it('should delete a story by ID', async () => {
    mockRequest = { params: { id: '1' }, session: mockSession };
    (storiesService.deleteStoryById as jest.Mock).mockResolvedValue(true);

    await storiesController.deleteStory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Story deleted successfully',
    });
  });

  it('should handle errors during story deletion', async () => {
    mockRequest = { params: { id: '99' }, session: mockSession };
    const error = new AppError('Error deleting story', 500);
    (storiesService.deleteStoryById as jest.Mock).mockRejectedValue(error);

    await storiesController.deleteStory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
