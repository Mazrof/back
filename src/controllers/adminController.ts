import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/adminService';
import { catchAsync } from '../utility';

// get all users
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
      phone: string | null;
      bio: string | null;
      status: boolean | null;
      activeNow: boolean | null;
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

// toggle user status
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
      status: boolean | null;
    } | null = await userService.toggleUserStatus(userId, adminId);
    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  }
);
