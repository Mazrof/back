import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import { AppError } from '../types/appError';
import { prisma } from '../prisma/client';

const isValidPhoneNumber = (phoneNumber: string) => {
  const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(phoneNumber);
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.getAllProfiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.users.findMany(); // Fetch all users from the database

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  }
);

exports.getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Get users ID from URL parameters
    const users = await prisma.users.findUnique({
      where: { id: parseInt(id, 10) }, // Find the users by ID
    });

    if (!users) {
      return next(new AppError('No profile found with that ID', 404)); // Handle not found error
    }
    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  }
);

exports.addProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const User = await prisma.users.create({
      data: req.body,
    });
    if (req.body.phone && !isValidPhoneNumber(req.body.phone)) {
      return next(new AppError('Invalid phone number', 400));
    }

    if (req.body.email && !isValidEmail(req.body.email)) {
      return next(new AppError('Invalid email format.', 400));
    }
    res.status(201).json({
      status: 'success',
      data: {
        User,
      },
    });
  }
);

exports.updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });

    if (!updatedUser) {
      return next(new AppError('No profile found with that ID', 404)); // Handle not found error
    }

    if (req.body.phone && !isValidPhoneNumber(req.body.phone)) {
      return next(new AppError('Invalid phone number', 400));
    }

    if (req.body.email && !isValidEmail(req.body.email)) {
      return next(new AppError('Invalid email format.', 400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        'updated user': updatedUser,
      },
    });
  }
);
