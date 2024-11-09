import * as profileRepository from '../repositories/profileRepository';
import { prisma } from '../prisma/client';

// Mocking the Prisma client methods used in the repository
jest.mock('../prisma/client', () => ({
  prisma: {
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Profile Repository', () => {
  it('should fetch all profiles', async () => {
    // Mocking the response for `findMany`
    (prisma.users.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: 'John Doe' },
    ]);
    const profiles = await profileRepository.findAllProfiles();
    expect(profiles).toEqual([{ id: 1, name: 'John Doe' }]);
  });

  it('should retrieve a profile by ID', async () => {
    // Mocking the response for `findUnique`
    (prisma.users.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'John Doe',
    });
    const profile = await profileRepository.findProfileById(1);
    expect(profile).toEqual({ id: 1, name: 'John Doe' });
  });

  it('should create a profile', async () => {
    const data = { name: 'Jane Doe', email: 'jane@example.com' };
    // Mocking the response for `create`
    (prisma.users.create as jest.Mock).mockResolvedValue({ id: 2, ...data });
    const profile = await profileRepository.createProfile(data);
    expect(profile).toEqual({ id: 2, ...data });
  });

  it('should update a profile by ID', async () => {
    const data = { name: 'Updated Name' };
    // Mocking the response for `update`
    (prisma.users.update as jest.Mock).mockResolvedValue({ id: 1, ...data });
    const updatedProfile = await profileRepository.updateProfileById(1, data);
    expect(updatedProfile).toEqual({ id: 1, ...data });
  });
});
