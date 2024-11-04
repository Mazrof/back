// src/controllers/profileController.ts
import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../utility';
import * as profileService from '../services/profileService';

export const getAllProfiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await profileService.getAllProfiles();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  }
);

export const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await profileService.getProfileById(parseInt(id, 10));
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }
);

export const addProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await profileService.createProfile(req.body);
    res.status(201).json({
      status: 'success',
      data: { user },
    });
  }
);

export const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updatedUser = await profileService.updateProfile(
      parseInt(id, 10),
      req.body
    );
    res.status(200).json({
      status: 'success',
      data: { updatedUser },
    });
  }
);
