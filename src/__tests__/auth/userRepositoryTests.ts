import { Users, Social, Admins, Privacy } from '@prisma/client';
import prisma from '../../prisma/client';
import { 
  createUser, 
  findUserByEmail,  
  findUserById,
  updateUserById,
  storeOAuthUser,
  addFcmToken
} from '../../repositories/userRepository';
import { OAuthUser } from '../../repositories/repositoriesTypes/authTypes';
import { AppError } from '../../utility';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

// Mock the entire prisma client
jest.mock('../../prisma/client', () => ({
  users: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  admins: {
    findUnique: jest.fn(),
  },
}));

describe('User Repository', () => {
  let mockUser: Users;
  let mockAdmin: Admins;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      id: 1,
      groupAddPermission: true,
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword',
      providerType: Social.google,
      providerId: '123456',
      photo: 'photo.jpg',
      isEmailVerified: true,
      publicKey: 'publickey123',
      privateKey: 'private',
      isPhoneVerified: true,
      readReceiptsEnabled: Privacy.everyone,
      storyVisibility: Privacy.everyone,
      fcmtokens: ['token1'],
      phone: '123456789',
      passwordChangedAt: new Date(),
      bio: 'This is a bio',
      screenName: 'testscreenname',
      status: true,
      lastSeen: new Date(),
      lastSeenVisibility: 'everyone',
      activeNow: true,
      autoDownloadSizeLimit: 50,
      maxLimitFileSize: 100,
      profilePicVisibility: 'everyone',
    };

    mockAdmin = {
      id: 1,
      email: 'admin@example.com',
      password: 'hashedpassword',
      passwordChangedAt: new Date(),
    };
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = { ...mockUser };
      delete userData.id;
      (prisma.users.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await createUser(userData);

      expect(prisma.users.create).toHaveBeenCalledWith({ data: userData });
      expect(result).toEqual(mockUser);
    });

    it('should handle database errors when creating user', async () => {
      const userData = { ...mockUser };
      delete userData.id;
      const error = new Error('Database error');
      (prisma.users.create as jest.Mock).mockRejectedValue(error);

      await expect(createUser(userData)).rejects.toThrow(error);
    });
  });

  describe('findUserByEmail', () => {
    it('should find a normal user by email', async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await findUserByEmail('test@example.com');

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(result).toEqual(mockUser);
    });

    it('should find an admin user by email', async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.admins.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const result = await findUserByEmail('admin@example.com');

      expect(prisma.admins.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@example.com' },
        include: { bannedUsers: true }
      });
      expect(result).toEqual(mockAdmin);
    });

    it('should return null if no user found', async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.admins.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (prisma.users.findUnique as jest.Mock).mockRejectedValue(error);

      await expect(findUserByEmail('test@example.com')).rejects.toThrow(error);
    });
  });

  describe('findUserById', () => {
    it('should find a user by id successfully', async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await findUserById(1);

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findUserById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (prisma.users.findUnique as jest.Mock).mockRejectedValue(error);

      await expect(findUserById(1)).rejects.toThrow(error);
    });
  });

  describe('updateUserById', () => {
    const updateData = {
      username: 'newusername',
      bio: 'Updated bio'
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      (prisma.users.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUserById(1, updateData);

      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (prisma.users.update as jest.Mock).mockRejectedValue(error);

      await expect(updateUserById(1, updateData)).rejects.toThrow(error);
    });
  });

  describe('storeOAuthUser', () => {
    const oauthUser: OAuthUser = {
      provider: 'google',
      providerId: '123456',
      userName: 'testuser',
      email: 'test@example.com',
      email_verified: true,
      picture: 'photo.jpg'
    };

    it('should store OAuth user successfully', async () => {
      (prisma.users.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await storeOAuthUser(oauthUser);

      expect(prisma.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: oauthUser.email,
          username: oauthUser.userName,
          providerType: Social.google,
          providerId: oauthUser.providerId,
          photo: oauthUser.picture,
          isEmailVerified: oauthUser.email_verified
        })
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle invalid provider error', async () => {
      const invalidOAuthUser = { ...oauthUser, provider: 'INVALID' };

      await expect(storeOAuthUser(invalidOAuthUser))
        .rejects
        .toThrow(new AppError('Invalid provider', 400));
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (prisma.users.create as jest.Mock).mockRejectedValue(error);

      await expect(storeOAuthUser(oauthUser)).rejects.toThrow(error);
    });
  });

  describe('addFcmToken', () => {
    it('should add FCM token successfully', async () => {
      const updatedUser = {
        ...mockUser,
        fcmtokens: [...mockUser.fcmtokens, 'newtoken']
      };
      (prisma.users.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await addFcmToken(1, 'newtoken');

      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { fcmtokens: { push: 'newtoken' } }
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (prisma.users.update as jest.Mock).mockRejectedValue(error);

      await expect(addFcmToken(1, 'newtoken')).rejects.toThrow(error);
    });
  });
});