import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import * as authController from '../controllers/authController';
import { AppError } from '../utility';

jest.mock('../services/authService'); // Mock the authService module
describe('Authentication Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockRequest = {
      body: {},
      session: {
        id: 'mockSessionId',
        cookie: {
          originalMaxAge: 0,
          expires: new Date(),
          secure: false,
          httpOnly: true,
          path: '/',
          domain: 'localhost',
        },
        regenerate: jest.fn(),
        destroy: jest.fn(),
        reload: jest.fn(),
        save: jest.fn(),
        touch: jest.fn(),
        resetMaxAge: jest.fn(),
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should signup a new user successfully', async () => {
    // Mock the service method
    const newUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };
    (authService.registerUser as jest.Mock).mockResolvedValue(newUser);

    // Call the controller method
    await authController.signup(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert the response
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  it('should login a user successfully', async () => {
    // Mock the service method
    const user = {
      id: 1,
      email: 'test@example.com',
      user_type: 'user',
    };
    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123',
    };
    (authService.authenticateUser as jest.Mock).mockResolvedValue(user);

    // Call the controller method
    await authController.login(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert the response
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('should handle login with invalid credentials', async () => {
    // Mock the service method
    mockRequest.body = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };
    (authService.authenticateUser as jest.Mock).mockResolvedValue(null);

    // Call the controller method
    await expect(
      authController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )
    ).rejects.toThrow(AppError);
  });

  it('should return current user when logged in', async () => {
    // Mock session with user
    mockRequest.session = {
      id: 'mockSessionId',
      cookie: {
        originalMaxAge: 0,
        expires: new Date(),
        secure: false,
        httpOnly: true,
        path: '/',
        domain: 'localhost',
      },
      regenerate: jest.fn(),
      destroy: jest.fn(),
      reload: jest.fn(),
      save: jest.fn(),
      touch: jest.fn(),
      resetMaxAge: jest.fn(),
      user: { id: 1, userType: 'user', user: null },
    };

    // Call the controller method
    await authController.whoami(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert the response
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { user: { id: 1, userType: 'user' } },
    });
  });

  it('should handle logout', async () => {
    // Mock logout method
    mockRequest.logout = jest.fn().mockImplementation((done: (err) => void) => {
      done(null);
    });

    // Call the controller method
    await authController.logoutController(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert the response
    expect(mockResponse.clearCookie).toHaveBeenCalledWith('connect.sid');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: { message: 'Logged out' },
    });
  });
});
