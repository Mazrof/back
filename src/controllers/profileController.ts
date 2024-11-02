import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppError } from '../utility';
import { prisma } from '../prisma/client';

export const profileController = require('./../controllers/profileController');
const isValidPhoneNumber = (phoneNumber: string) => {
  const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(phoneNumber);
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getAllProfiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.users.findMany();

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
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) {
      return next(new AppError('No profile found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }
);

export const addProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.phone && !isValidPhoneNumber(req.body.phone)) {
      return next(new AppError('Invalid phone number', 400));
    }

    if (req.body.email && !isValidEmail(req.body.email)) {
      return next(new AppError('Invalid email format', 400));
    }

    const user = await prisma.users.create({
      data: req.body,
    });

    res.status(201).json({
      status: 'success',
      data: { user },
    });
  }
);

export const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (req.body.phone && !isValidPhoneNumber(req.body.phone)) {
      return next(new AppError('Invalid phone number', 400));
    }

    if (req.body.email && !isValidEmail(req.body.email)) {
      return next(new AppError('Invalid email format', 400));
    }

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });

    if (!updatedUser) {
      return next(new AppError('No profile found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { updatedUser },
    });
  }
);

export const getProfileByUserName = async (query: string) => {
  try {
    const userProfiles = await prisma.users.findMany({
      where: {
        username: {
          contains: query,
        },
      },
    });

    return userProfiles;
  } catch (error) {
    if (error instanceof AppError) {
      throw error; // Re-throw AppError to be handled by higher-level error middleware
    } else {
      throw new AppError(`Error fetching profiles`, 500);
    }
  }
};
