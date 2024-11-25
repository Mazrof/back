import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profileService';
import * as profileController from '../controllers/profileController';
import { AppError } from '../utility';

jest.mock('../services/profileService');

describe('Profile Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should fetch all profiles successfully', async () => {
    (profileService.getAllProfiles as jest.Mock).mockResolvedValue([
      { id: 1, name: 'John Doe' },
    ]);

    await profileController.getAllProfiles(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      results: 1,
      data: { users: [{ id: 1, name: 'John Doe' }] },
    });
  });

  it('should fetch a profile by ID', async () => {
    mockRequest = { params: { id: '1' } };
    (profileService.getProfileById as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'John Doe',
    });

    await profileController.getProfile(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { user: { id: 1, name: 'John Doe' } },
    });
  });

  it('should handle errors when profile ID is not found', async () => {
    mockRequest = { params: { id: '99' } };
    const error = new AppError('No profile found with that ID', 404);
    (profileService.getProfileById as jest.Mock).mockRejectedValue(error);

    await profileController.getProfile(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should create a profile', async () => {
    mockRequest = { body: { name: 'Jane Doe', email: 'jane@example.com' } };
    const newUser = { id: 2, name: 'Jane Doe', email: 'jane@example.com' };
    (profileService.createProfile as jest.Mock).mockResolvedValue(newUser);

    await profileController.addProfile(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { user: newUser },
    });
  });

  it('should update a profile', async () => {
    mockRequest = { params: { id: '1' }, body: { name: 'Updated Name' } };
    const updatedUser = { id: 1, name: 'Updated Name' };
    (profileService.updateProfile as jest.Mock).mockResolvedValue(updatedUser);

    await profileController.updateProfile(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { updatedUser },
    });
  });
});
