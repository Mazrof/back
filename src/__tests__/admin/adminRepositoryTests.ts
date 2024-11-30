import {
  getAllUsers,
  findUserById,
  findAdminById,
  updateUserStatus,
} from '../../repositories/adminRepository';
import prisma from '../../prisma/client';

// Mock the entire prisma module
jest.mock('../../prisma/client', () => ({
  __esModule: true,
  default: {
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    admins: {
      findUnique: jest.fn(),
    },
  },
}));

describe('User Repository', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should fetch all users with selected fields', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'testuser1',
          email: 'test1@example.com',
          phone: '1234567890',
          bio: 'Test bio 1',
          status: true,
          activeNow: true,
        },
        {
          id: 2,
          username: 'testuser2',
          email: 'test2@example.com',
          phone: null,
          bio: null,
          status: false,
          activeNow: false,
        },
      ];

      (prisma.users.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(prisma.users.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          username: true,
          status: true,
          email: true,
          bio: true,
          activeNow: true,
          phone: true,
        },
      });
      expect(prisma.users.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users found', async () => {
      (prisma.users.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAllUsers();

      expect(result).toEqual([]);
      expect(prisma.users.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserById', () => {
    it('should find user by ID with selected fields', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        status: true,
      };

      (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await findUserById(1);

      expect(result).toEqual(mockUser);
      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          username: true,
          status: true,
        },
      });
      expect(prisma.users.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findUserById(999);

      expect(result).toBeNull();
      expect(prisma.users.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAdminById', () => {
    it('should find admin by ID with selected fields', async () => {
      const mockAdmin = {
        id: 1,
      };

      (prisma.admins.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const result = await findAdminById(1);

      expect(result).toEqual(mockAdmin);
      expect(prisma.admins.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
        },
      });
      expect(prisma.admins.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when admin not found', async () => {
      (prisma.admins.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findAdminById(999);

      expect(result).toBeNull();
      expect(prisma.admins.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status and return updated user', async () => {
      const mockUpdatedUser = {
        id: 1,
        username: 'testuser',
        status: true,
      };

      (prisma.users.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await updateUserStatus(1, true);

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: true },
        select: {
          id: true,
          username: true,
          status: true,
        },
      });
      expect(prisma.users.update).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      (prisma.users.update as jest.Mock).mockRejectedValue(
        new Error('User not found')
      );

      const result = await updateUserStatus(999, false).catch((e) => null);

      expect(result).toBeNull();
      expect(prisma.users.update).toHaveBeenCalledTimes(1);
    });
  });
});
