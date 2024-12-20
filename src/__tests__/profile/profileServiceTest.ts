import * as profileService from '../../services/profileService';
import * as profileRepository from '../../repositories/profileRepository';
import { AppError } from '../../utility';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));
jest.mock('../../repositories/profileRepository');

describe('Profile Service', () => {
  it('should fetch all profiles', async () => {
    (profileRepository.findAllProfiles as jest.Mock).mockResolvedValue([
      { id: 1, name: 'John Doe' },
    ]);
    const profiles = await profileService.getAllProfiles();
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
    await expect(profileService.getProfileById(99)).rejects.toThrow(AppError);
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

    try {
      await profileService.createProfile(data);
    } catch (error) {
      expect(error).toEqual(new AppError('Invalid phone number', 400));
    }
  });

  it('should fail to create a profile with an invalid email', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'janeexample.com', //invalid email
      phone: '+123444567890',
    };

    try {
      await profileService.createProfile(data);
    } catch (error) {
      expect(error).toEqual(new AppError('Invalid email format', 400));
    }
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
    try {
      await profileService.updateProfile(1, data);
    } catch (error) {
      expect(error).toEqual(new AppError('Invalid phone number', 400));
    }
  });

  it('should fail to update a profile with an invalid email', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'janeexample.com', //invalid email
      phone: '+123444567890',
    };
    (profileRepository.updateProfileById as jest.Mock).mockResolvedValue({
      id: 1,
      ...data,
    });
    try {
      await profileService.updateProfile(1, data);
    } catch (error) {
      expect(error).toEqual(new AppError('Invalid email format', 400));
    }
  });
});
