import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { catchAsync } from '../utility';
import { AppError } from '../utility';

// Function to read data from JSON file
const readDataFromFile = () => {
  const dataPath = path.join(__dirname, './../data/profiles.json'); // Adjust the path as necessary
  const jsonData = fs.readFileSync(dataPath, 'utf-8'); // Read as UTF-8
  return JSON.parse(jsonData);
};

// Get all profiles
exports.getAllProfiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profiles = readDataFromFile(); // Read profiles from JSON file

    res.status(200).json({
      status: 'success',
      results: profiles.length,
      data: {
        profiles,
      },
    });
  }
);

// Get a single profile by ID
exports.getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Get profile ID from URL parameters
    const profiles = readDataFromFile();
    const profile = profiles.find((p: { id: string }) => p.id === id); // Find the profile by ID

    if (!profile) {
      return next(new AppError('No profile found with that ID', 404)); // Handle not found error
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile,
      },
    });
  }
);

// Add a new profile
exports.addProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profiles = readDataFromFile(); // Read existing profiles
    const newProfile = { id: (profiles.length + 1).toString(), ...req.body }; // Create a new profile with a unique ID
    profiles.push(newProfile); // Add the new profile to the array

    // Save the updated profiles back to the JSON file
    fs.writeFileSync(
      path.join(__dirname, './../data/profiles.json'),
      JSON.stringify(profiles, null, 2)
    );

    res.status(201).json({
      status: 'success',
      data: {
        profile: newProfile,
      },
    });
  }
);

// Update a profile by ID
exports.updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Get profile ID from URL parameters
    const profiles = readDataFromFile(); // Read existing profiles
    const profileIndex = profiles.findIndex((p: { id: string }) => p.id === id); // Find the index of the profile to update

    if (profileIndex === -1) {
      return next(new AppError('No profile found with that ID', 404)); // Handle not found error
    }

    // Update the profile data
    profiles[profileIndex] = { ...profiles[profileIndex], ...req.body };

    // Save the updated profiles back to the JSON file
    fs.writeFileSync(
      path.join(__dirname, './../data/profiles.json'),
      JSON.stringify(profiles, null, 2)
    );

    res.status(200).json({
      status: 'success',
      data: {
        profile: profiles[profileIndex],
      },
    });
  }
);
