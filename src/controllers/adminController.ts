/**
 * Import required modules for handling HTTP requests and user services.
 */
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/adminService';
import { catchAsync } from '../utility';

/**
 * Controller to fetch all users.
 * Requires the requester to be an authorized admin.
 *
 * @param {Request} req - The HTTP request object, containing admin session ID.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing an array of user objects.
 * @throws {AppError} If the admin is not authorized or no users are found.
 */
export const getAllUsers = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const adminId: number = req.session.user.id;

    const users: {
      id: number;
      username: string;
      email: string;
      phone: string;
      bio: string;
      status: boolean;
      activeNow: boolean;
    }[] = await userService.getAllUsers(adminId);

    return res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  }
);

/**
 * Controller to toggle the active status of a user.
 * Requires the requester to be an authorized admin.
 *
 * @param {Request} req - The HTTP request object, containing admin session ID and user ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the updated user object.
 * @throws {AppError} If the admin is not authorized or the user is not found.
 */
export const banUser = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const adminId: number = req.session.user.id;
    const userId: number = parseInt(req.params.userId);

    const user: {
      id: number;
      username: string;
      status: boolean;
    } | null = await userService.toggleUserStatus(userId, adminId);

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  }
);
