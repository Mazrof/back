import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/adminService';
import { catchAsync } from '../utility';

// get all users
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = parseInt(req.body.adminId);
    const users = await userService.getAllUsers(adminId);
    return res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  }
);

// toggle user status
export const banUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = parseInt(req.body.adminId);
    const userId = parseInt(req.params.userId);
    const user = await userService.toggleUserStatus(userId, adminId);
    return res.status(200).json({
      status: 'success',
      data: { user },
    });
  }
);
