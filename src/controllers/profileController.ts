import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import { AppError } from '../utility';
import { prisma } from '../prisma/client';

// Get all profiles
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

// Get a single profile by ID
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

// Add a new profile
exports.addProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newuser = await prisma.users.create({
      data: req.body, // Create a new users with data from the request body
    });

    res.status(201).json({
      status: 'success',
      data: {
        users: newuser,
      },
    });
  }
);

// Update a profile by ID
exports.updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Get users ID from URL parameters
    const updatedusers = await prisma.users.update({
      where: { id: parseInt(id, 10) }, // Update the users by ID
      data: req.body,
    });

    if (!updatedusers) {
      return next(new AppError('No profile found with that ID', 404)); // Handle not found error
    }

    res.status(200).json({
      status: 'success',
      data: {
        users: updatedusers,
      },
    });
  }
);
