// Mock firebase-admin module
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn().mockReturnValue({}),
  },
  storage: jest.fn().mockReturnValue({
    bucket: jest.fn().mockReturnValue({}),
  }),
}));

import { getAllUsers, toggleUserStatus } from '../../services/adminService';
import * as userRepository from '../../repositories/adminRepository';
import { AppError } from '../../utility';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

jest.mock('../../repositories/adminRepository');

describe('Admin Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
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

    it('should fetch all users when admin is authorized', async () => {
      (userRepository.findAdminById as jest.Mock).mockResolvedValue({ id: 1 });
      (userRepository.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getAllUsers(1);

      expect(result).toEqual(mockUsers);
      expect(userRepository.findAdminById).toHaveBeenCalledWith(1);
      expect(userRepository.getAllUsers).toHaveBeenCalled();
    });

    it('should throw AppError when admin is not found', async () => {
      (userRepository.findAdminById as jest.Mock).mockResolvedValue(null);

      await expect(getAllUsers(999)).rejects.toThrow(
        new AppError('Not Authorized', 403)
      );
      expect(userRepository.findAdminById).toHaveBeenCalledWith(999);
      expect(userRepository.getAllUsers).not.toHaveBeenCalled();
    });

    it('should throw AppError when no users are found', async () => {
      (userRepository.findAdminById as jest.Mock).mockResolvedValue({ id: 1 });
      (userRepository.getAllUsers as jest.Mock).mockResolvedValue(null);

      await expect(getAllUsers(1)).rejects.toThrow(
        new AppError('No users found', 404)
      );
      expect(userRepository.findAdminById).toHaveBeenCalledWith(1);
      expect(userRepository.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('toggleUserStatus', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      status: true,
    };

    const mockUpdatedUser = {
      id: 1,
      username: 'testuser',
      status: false,
    };

    it('should toggle user status when admin is authorized and user exists', async () => {
      (userRepository.findAdminById as jest.Mock).mockResolvedValue({ id: 1 });
      (userRepository.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.updateUserStatus as jest.Mock).mockResolvedValue(
        mockUpdatedUser
      );

      const result = await toggleUserStatus(1, 1);

      expect(result).toEqual(mockUpdatedUser);
      expect(userRepository.findAdminById).toHaveBeenCalledWith(1);
      expect(userRepository.findUserById).toHaveBeenCalledWith(1);
      expect(userRepository.updateUserStatus).toHaveBeenCalledWith(1, false);
    });

    it('should throw AppError when admin is not found', async () => {
      (userRepository.findAdminById as jest.Mock).mockResolvedValue(null);

      await expect(toggleUserStatus(1, 999)).rejects.toThrow(
        new AppError('Not Authorized', 403)
      );
      expect(userRepository.findAdminById).toHaveBeenCalledWith(999);
      expect(userRepository.findUserById).not.toHaveBeenCalled();
      expect(userRepository.updateUserStatus).not.toHaveBeenCalled();
    });

    it('should throw AppError when user is not found', async () => {
      (userRepository.findAdminById as jest.Mock).mockResolvedValue({ id: 1 });
      (userRepository.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(toggleUserStatus(999, 1)).rejects.toThrow(
        new AppError('No user found with that ID', 404)
      );
      expect(userRepository.findAdminById).toHaveBeenCalledWith(1);
      expect(userRepository.findUserById).toHaveBeenCalledWith(999);
      expect(userRepository.updateUserStatus).not.toHaveBeenCalled();
    });

    it('should handle toggle from false to true', async () => {
      const inactiveUser = { ...mockUser, status: false };
      const reactivatedUser = { ...mockUser, status: true };

      (userRepository.findAdminById as jest.Mock).mockResolvedValue({ id: 1 });
      (userRepository.findUserById as jest.Mock).mockResolvedValue(
        inactiveUser
      );
      (userRepository.updateUserStatus as jest.Mock).mockResolvedValue(
        reactivatedUser
      );

      const result = await toggleUserStatus(1, 1);

      expect(result).toEqual(reactivatedUser);
      expect(userRepository.updateUserStatus).toHaveBeenCalledWith(1, true);
    });

    it('should handle repository errors gracefully', async () => {
      (userRepository.findAdminById as jest.Mock).mockResolvedValue({ id: 1 });
      (userRepository.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.updateUserStatus as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(toggleUserStatus(1, 1)).rejects.toThrow('Database error');
      expect(userRepository.findAdminById).toHaveBeenCalledWith(1);
      expect(userRepository.findUserById).toHaveBeenCalledWith(1);
      expect(userRepository.updateUserStatus).toHaveBeenCalledWith(1, false);
    });
  });
});
