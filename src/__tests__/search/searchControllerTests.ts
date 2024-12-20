import { Request, Response, NextFunction } from 'express';
import * as searchService from '../../services/searchService';
import { generalSearch } from '../../controllers/searchController';
import { AppError } from '../../utility';

jest.mock('../../services/searchService');

describe('generalSearch Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should return an empty result if query is an empty string', async () => {
    mockRequest = { query: { query: '' } };

    await generalSearch(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: {},
    });
  });

  it('should return results for valid query', async () => {
    mockRequest = { query: { query: 'John' } };

    const mockUsers = [{ id: 1, name: 'John Doe' }];
    const mockChannels = [{ id: 1, name: 'Tech Talk' }];
    const mockGroups = [{ id: 1, name: 'Developers' }];

    (searchService.getChannelByChannelName as jest.Mock).mockResolvedValue(
      mockChannels
    );
    (searchService.getProfileByUsername as jest.Mock).mockResolvedValue(
      mockUsers
    );
    (searchService.getGroupByGroupName as jest.Mock).mockResolvedValue(
      mockGroups
    );

    await generalSearch(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        users: mockUsers,
        channels: mockChannels,
        groups: mockGroups,
      },
    });
  });

  it('should handle errors in search services', async () => {
    mockRequest = { query: { query: 'john' } };

    const error = new Error('Some error occurred');
    (searchService.getChannelByChannelName as jest.Mock).mockRejectedValue(
      error
    );

    await generalSearch(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
