import { Request, Response, NextFunction } from 'express';
import * as authService from '../../services/authService';
import {
    login,
    signup,
    logoutController,
    
} from '../../controllers/authController';

jest.mock('../../services/authService');

describe('Auth Controller', () => {
    let mockRequest;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            clearCookie: jest.fn()
        };

        mockNext = jest.fn();

        mockRequest = {
            session: {},
            body: {}
        };
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                name: 'Test User'
            };

            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            (authService.registerUser as jest.Mock).mockResolvedValue(mockUser);

            await login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(authService.authenticateUser).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'success',
                data: { user: mockUser }
            });
        });

        it('should handle login errors', async () => {
            const error = new Error('Invalid credentials');
            mockRequest.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            (authService.authenticateUser as jest.Mock).mockRejectedValue(error);

            await login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('register', () => {
        it('should register user successfully', async () => {
            const mockUser = {
                id: 1,
                email: 'newuser@example.com',
                name: 'New User'
            };

            mockRequest.body = {
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User'
            };

            (authService.registerUser as jest.Mock).mockResolvedValue(mockUser);

            await signup(mockRequest as Request, mockResponse as Response, mockNext);

            expect(authService.registerUser).toHaveBeenCalledWith({
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User'
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'success',
                data: { user: mockUser }
            });
        });

        it('should handle registration errors', async () => {
            const error = new Error('Email already exists');
            mockRequest.body = {
                email: 'existing@example.com',
                password: 'password123',
                name: 'New User'
            };

            (authService.registerUser as jest.Mock).mockRejectedValue(error);

            await signup(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            mockRequest.session = {
                destroy: jest.fn((cb) => cb())
            };

            await logoutController(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockRequest.session.destroy).toHaveBeenCalled();
            expect(mockResponse.clearCookie).toHaveBeenCalledWith('connect.sid');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'success'
            });
        });

        it('should handle logout errors', async () => {
            const error = new Error('Session error');
            mockRequest.session = {
                destroy: jest.fn((cb) => cb(error))
            };

            await logoutController(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

});