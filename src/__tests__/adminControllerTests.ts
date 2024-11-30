import { Request, Response, NextFunction } from 'express';
import { getAllUsers, banUser } from '../controllers/adminController';
import * as userService from '../services/adminService';
import { catchAsync } from '../utility';

// Mock the userService
jest.mock('../services/adminService');
describe('Admin Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup mock next function
    mockNext = jest.fn();
  });

  describe('getAllUsers', () => {
    const mockUsers = [
      {
        id: 1,
        username: 'testuser1',
        email: 'test1@example.com',
        phone: '1234567890',
        bio: 'Test bio 1',
        status: true,
        activeNow: true,
      },
      {
        id: 2,
        username: 'testuser2',
        email: 'test2@example.com',
        phone: null,
        bio: null,
        status: false,
        activeNow: false,
      },
    ];

    it('should get all users successfully', async () => {
      // Setup mock request
      mockRequest = {
        body: { adminId: '1' },
      };

      // Mock service response
      (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.getAllUsers).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockUsers.length,
        data: { users: mockUsers },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle invalid adminId', async () => {
      // Setup mock request with invalid adminId
      mockRequest = {
        body: { adminId: 'invalid' },
      };

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.getAllUsers).toHaveBeenCalledWith(NaN);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockRequest = {
        body: { adminId: '1' },
      };

      const error = new Error('Service error');
      (userService.getAllUsers as jest.Mock).mockRejectedValue(error);

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.getAllUsers).toHaveBeenCalledWith(1);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('banUser', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      status: false,
    };

    it('should toggle user status successfully', async () => {
      // Setup mock request
      mockRequest = {
        body: { adminId: '1' },
        params: { userId: '2' },
      };

      // Mock service response
      (userService.toggleUserStatus as jest.Mock).mockResolvedValue(mockUser);

      await banUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.toggleUserStatus).toHaveBeenCalledWith(2, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle invalid adminId or userId', async () => {
      // Setup mock request with invalid IDs
      mockRequest = {
        body: { adminId: 'invalid' },
        params: { userId: 'invalid' },
      };

      await banUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.toggleUserStatus).toHaveBeenCalledWith(NaN, NaN);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockRequest = {
        body: { adminId: '1' },
        params: { userId: '2' },
      };

      const error = new Error('Service error');
      (userService.toggleUserStatus as jest.Mock).mockRejectedValue(error);

      await banUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.toggleUserStatus).toHaveBeenCalledWith(2, 1);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle null response from service', async () => {
      mockRequest = {
        body: { adminId: '1' },
        params: { userId: '2' },
      };

      (userService.toggleUserStatus as jest.Mock).mockResolvedValue(null);

      await banUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(userService.toggleUserStatus).toHaveBeenCalledWith(2, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: null },
      });
    });
  });

  describe('catchAsync wrapper', () => {
    it('should pass errors to next function', async () => {
      const error = new Error('Test error');
      const handler = jest.fn().mockRejectedValue(error);
      const wrapped = catchAsync(handler);

      await wrapped(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle successful execution', async () => {
      const handler = jest.fn().mockResolvedValue('success');
      const wrapped = catchAsync(handler);

      await wrapped(mockRequest as Request, mockResponse as Response, mockNext);

      expect(handler).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
