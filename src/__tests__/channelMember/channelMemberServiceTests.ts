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

import * as Repository from '../../repositories';
import * as Service from '../../services/channelMemberService';
import { AppError } from '../../utility';
import { CommunityRole } from '@prisma/client';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));
// Mock the repository functions
jest.mock('../../repositories');

describe('channelMemberService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findChannel', () => {
    it('should throw an error if the channel does not exist', async () => {
      (Repository.findChannelById as jest.Mock).mockResolvedValue(null);

      await expect(Service.findChannel(1)).rejects.toThrow(
        new AppError('No channel found with this ID', 404)
      );
      expect(Repository.findChannelById).toHaveBeenCalledWith(1);
    });

    it('should not throw an error if the channel exists', async () => {
      const mockChannel = { id: 1, community: { active: true } };
      (Repository.findChannelById as jest.Mock).mockResolvedValue(mockChannel);

      await expect(Service.findChannel(1)).resolves.not.toThrow();
      expect(Repository.findChannelById).toHaveBeenCalledWith(1);
    });
  });

  describe('checkUser', () => {
    it('should throw an error if the user does not exist', async () => {
      (Repository.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(Service.checkUser(1)).rejects.toThrow(
        new AppError('No user found with this ID', 404)
      );
      expect(Repository.findUserById).toHaveBeenCalledWith(1);
    });

    it('should not throw an error if the user exists', async () => {
      const mockUser = { id: 1, username: 'testuser', status: true };
      (Repository.findUserById as jest.Mock).mockResolvedValue(mockUser);

      await expect(Service.checkUser(1)).resolves.not.toThrow();
      expect(Repository.findUserById).toHaveBeenCalledWith(1);
    });
  });

  describe('checkChannelMemberPermission', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if the user is not an admin', async () => {
      // Mock the checkChannelMember function
      jest.spyOn(Service, 'checkChannelMember').mockResolvedValue({
        role: CommunityRole.member,
        active: true,
        hasDownloadPermissions: false,
      });

      await expect(Service.checkChannelMemberPermission(1, 1)).rejects.toThrow(
        new AppError('Not Authorized', 403)
      );

      expect(Service.checkChannelMember).toHaveBeenCalledWith(1, 1);
    });

    it('should not throw an error if the user is an admin', async () => {
      // Mock the checkChannelMember function
      jest.spyOn(Service, 'checkChannelMember').mockResolvedValue({
        role: CommunityRole.admin,
        active: true,
        hasDownloadPermissions: false,
      });

      await expect(Service.checkChannelMemberPermission(1, 1)).resolves.not.toThrow();
      expect(Service.checkChannelMember).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('addChannelMember', () => {
    it('should add a new member if they do not already exist', async () => {
      (Repository.findExistingMember as jest.Mock).mockResolvedValue(null);
      (Repository.addChannelMember as jest.Mock).mockResolvedValue({
        channelId: 1,
        userId: 2,
        role: CommunityRole.member,
        hasDownloadPermissions: false,
      });

      const result = await Service.addChannelMember(2, 1, 3, CommunityRole.member, false);

      expect(result).toEqual({
        channelId: 1,
        userId: 2,
        role: CommunityRole.member,
        hasDownloadPermissions: false,
      });
      expect(Repository.addChannelMember).toHaveBeenCalledWith({
        channelId: 1,
        userId: 2,
        role: CommunityRole.member,
        hasDownloadPermissions: false,
      });
    });

    it('should throw an error if the requester does not have admin rights to add an admin', async () => {
      // Mock the checkAdmin function
      jest.spyOn(Service, 'checkAdmin').mockImplementation(() => {
        throw new AppError('Not Authorized', 403);
      });

      await expect(
        Service.addChannelMember(2, 1, 3, CommunityRole.admin, true)
      ).rejects.toThrow(new AppError('Not Authorized', 403));

      expect(Service.checkAdmin).toHaveBeenCalledWith(3, 1);
    });
  });

  describe('deleteChannelMember', () => {
    it('should throw an error if the member does not exist', async () => {
      (Repository.findExistingMember as jest.Mock).mockResolvedValue(null);

      await expect(Service.deleteChannelMember(1, 2)).rejects.toThrow(
        new AppError('Member not found in this channel', 404)
      );
      expect(Repository.findExistingMember).toHaveBeenCalledWith(2, 1);
    });

    it('should deactivate the member if they exist', async () => {
      (Repository.findExistingMember as jest.Mock).mockResolvedValue({
        id: 1,
        active: true,
        role: CommunityRole.member,
      });
      (Repository.updateChannelMember as jest.Mock).mockResolvedValue({
        id: 1,
        active: false,
      });

      const result = await Service.deleteChannelMember(1, 2);

      expect(result).toEqual({ id: 1, active: false });
      expect(Repository.updateChannelMember).toHaveBeenCalledWith(2, 1, {
        active: false,
      });
    });
  });

  describe('checkChannelMember', () => {
    it('should throw an error if the user is not a member or is inactive', async () => {
      jest.spyOn(Service, 'findChannel').mockResolvedValue(); // Mock findChannel to succeed
      (Repository.findExistingMember as jest.Mock).mockResolvedValue(null); // Simulate no member found

      await expect(Service.checkChannelMember(1, 1)).rejects.toThrow(
        new AppError('User is not a member of the channel', 403)
      );

      expect(Repository.findExistingMember).toHaveBeenCalledWith(1, 1);
    });

    it('should return the channel member details if the user is active', async () => {
      jest.spyOn(Service, 'findChannel').mockResolvedValue();
      const mockMember = {
        hasDownloadPermissions: false,
        active: true,
        role: CommunityRole.admin,
      };
      (Repository.findExistingMember as jest.Mock).mockResolvedValue(mockMember);

      const result = await Service.checkChannelMember(1, 1);

      expect(result).toEqual(mockMember);
      expect(Repository.findExistingMember).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('checkMember', () => {
    it('should return null if the user is not an existing member', async () => {
      jest.spyOn(Service, 'checkUser').mockResolvedValue();
      (Repository.findExistingMember as jest.Mock).mockResolvedValue(null);

      const result = await Service.checkMember(1, 1);

      expect(result).toBeNull();
      expect(Repository.findExistingMember).toHaveBeenCalledWith(1, 1);
    });

    it('should update and return the member if they are inactive', async () => {
      jest.spyOn(Service, 'checkUser').mockResolvedValue();
      const mockInactiveMember = {
        active: false,
        role: CommunityRole.member,
      };
      (Repository.findExistingMember as jest.Mock).mockResolvedValue(mockInactiveMember);
      const updatedMember = {
        active: true,
        role: CommunityRole.member,
      };
      (Repository.updateChannelMember as jest.Mock).mockResolvedValue(updatedMember);

      const result = await Service.checkMember(1, 1);

      expect(result).toEqual(updatedMember);
      expect(Repository.updateChannelMember).toHaveBeenCalledWith(1, 1, {
        active: true,
        role: CommunityRole.member,
      });
    });

    it('should throw an error if the member is already active', async () => {
      jest.spyOn(Service, 'checkUser').mockResolvedValue();
      const mockActiveMember = {
        active: true,
        role: CommunityRole.member,
      };
      (Repository.findExistingMember as jest.Mock).mockResolvedValue(mockActiveMember);

      await expect(Service.checkMember(1, 1)).rejects.toThrow(
        new AppError('Member already exists in this channel', 400)
      );
    });
  });

  describe('updateChannelMember', () => {
    it('should throw an error if no data is provided to update', async () => {
      await expect(
        Service.updateChannelMember(1, 1, 1, {})
      ).rejects.toThrow(new AppError('No data to update', 400));
    });

    it('should throw an error if the member is not found or inactive', async () => {
      jest.spyOn(Service, 'findChannel').mockResolvedValue();
      (Repository.findExistingMember as jest.Mock).mockResolvedValue(null);

      await expect(Service.updateChannelMember(1, 1, 1, { role: 'admin' })).rejects.toThrow(
        new AppError('User is not a member of the channel', 404)
      );
    });

    it('should update the channel member successfully if data is valid', async () => {
      const mockMember = { id: 1, role: 'member', active: true };
      (Repository.findExistingMember as jest.Mock).mockResolvedValue(mockMember);
      (Repository.updateChannelMember as jest.Mock).mockResolvedValue({
        ...mockMember,
        role: 'admin',
      });

      const result = await Service.updateChannelMember(1, 1, 1, { role: 'admin' });

      expect(result).toEqual({ ...mockMember, role: 'admin' });
      expect(Repository.updateChannelMember).toHaveBeenCalledWith(1, 1, {
        role: 'admin',
      });
    });
  });
});
