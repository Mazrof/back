import * as profileService from '../services/profileService';
import * as profileRepository from '../repositories/profileRepository';
import { AppError } from '../utility';

// Mock the repository methods
jest.mock('../repositories/profileRepository');

describe('Profile Service', () => {
  it('should fetch all profiles', async () => {
    // Mocking the repository method
    (profileRepository.findAllProfiles as jest.Mock).mockResolvedValue([
      { id: 1, name: 'John Doe' },
    ]);

    // Calling the service method
    const profiles = await profileService.getAllProfiles();

    // Assertion
    expect(profiles).toEqual([{ id: 1, name: 'John Doe' }]);
  });

  it('should retrieve a profile by ID', async () => {
    (profileRepository.findProfileById as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'John Doe',
    });

    const profile = await profileService.getProfileById(1);
    expect(profile).toEqual({ id: 1, name: 'John Doe' });
  });

  it('should throw error if profile ID not found', async () => {
    (profileRepository.findProfileById as jest.Mock).mockResolvedValue(null);
    await expect(profileService.getProfileById(99)).rejects.toThrowError(
      AppError
    );
  });

  it('should create a profile with valid data', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+123444567890',
    };
    (profileRepository.createProfile as jest.Mock).mockResolvedValue({
      id: 2,
      ...data,
    });

    const profile = await profileService.createProfile(data);
    expect(profile).toEqual({ id: 2, ...data });
  });

  it('should fail to create a profile with an invalid phone number', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+123444567', // Invalid phone number
    };

    await expect(profileService.createProfile(data)).rejects.toEqual(
      new AppError('Invalid phone number', 400)
    );
  });

  it('should fail to create a profile with an invalid email', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'janeexample.com', // Invalid email
      phone: '+123444567890',
    };

    await expect(profileService.createProfile(data)).rejects.toEqual(
      new AppError('Invalid email format', 400)
    );
  });

  it('should update a profile', async () => {
    const data = { name: 'Updated Name' };
    (profileRepository.updateProfileById as jest.Mock).mockResolvedValue({
      id: 1,
      ...data,
    });

    const updatedProfile = await profileService.updateProfile(1, data);
    expect(updatedProfile).toEqual({ id: 1, ...data });
  });

  it('should fail to update a profile with an invalid phone number', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+123444567', // Invalid phone number
    };
    (profileRepository.updateProfileById as jest.Mock).mockResolvedValue({
      id: 1,
      ...data,
    });

    await expect(profileService.updateProfile(1, data)).rejects.toEqual(
      new AppError('Invalid phone number', 400)
    );
  });

  it('should fail to update a profile with an invalid email', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'janeexample.com', // Invalid email
      phone: '+123444567890',
    };
    (profileRepository.updateProfileById as jest.Mock).mockResolvedValue({
      id: 1,
      ...data,
    });

    await expect(profileService.updateProfile(1, data)).rejects.toEqual(
      new AppError('Invalid email format', 400)
    );
  });

  it('should fail to get the updated user profile if no profile is found', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+123444567890',
    };

    // Simulate no profile found
    (profileRepository.updateProfileById as jest.Mock).mockResolvedValue(null);

    await expect(profileService.updateProfile(50, data)).rejects.toEqual(
      new AppError('No profile found with that ID', 404)
    );
  });
});
