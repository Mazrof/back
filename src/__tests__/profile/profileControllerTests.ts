import { Request, Response, NextFunction } from 'express';
import * as profileService from '../../services/profileService';
import * as profileController from '../../controllers/profileController';
import { AppError } from '../../utility';

jest.mock('../../services/profileService'); // Mock the profileService module

describe('Profile Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should fetch all profiles successfully', async () => {
    // Mock the service method
    (profileService.getAllProfiles as jest.Mock).mockResolvedValue([
      { id: 1, name: 'John Doe' },
    ]);

    // Call the controller method
    await profileController.getAllProfiles(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert the response
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      results: 1,
      data: { users: [{ id: 1, name: 'John Doe' }] },
    });
  });

  it('should fetch a profile by ID', async () => {
    // Mock request and service method
    mockRequest = { params: { id: '1' } };
    (profileService.getProfileById as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'John Doe',
    });

    // Call the controller method
    await profileController.getProfile(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert the response
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { user: { id: 1, name: 'John Doe' } },
    });
  });

  it('should handle errors when profile ID is not found', async () => {
    // Mock request and service method
    mockRequest = { params: { id: '99' } };
    const error = new AppError('No profile found with that ID', 404);
    (profileService.getProfileById as jest.Mock).mockRejectedValue(error);

    // Call the controller method
    await profileController.getProfile(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert that the error was passed to the next middleware
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should create a profile', async () => {
    // Mock request and service method
    mockRequest = { body: { name: 'Jane Doe', email: 'jane@example.com' } };
    const newUser = { id: 2, name: 'Jane Doe', email: 'jane@example.com' };
    (profileService.createProfile as jest.Mock).mockResolvedValue(newUser);

    // Call the controller method
    await profileController.addProfile(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert the response
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { user: newUser },
    });
  });

  it('should update a profile', async () => {
    // Mock request and service method
    mockRequest = { params: { id: '1' }, body: { name: 'Updated Name' } };
    const updatedUser = { id: 1, name: 'Updated Name' };
    (profileService.updateProfile as jest.Mock).mockResolvedValue(updatedUser);

    // Call the controller method
    await profileController.updateProfile(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert the response
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { updatedUser },
    });
  });
});
