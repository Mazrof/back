import * as channelMemberService from '../../services/channelMemberService';
import * as channelMemberRepository from '../../repositories/channelMemberRepository';
import * as channelRepository from '../../repositories/channelRepository';
import * as userRepository from '../../repositories/adminRepository';
import { CommunityRole } from '@prisma/client';
import crypto from 'crypto';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

jest.mock('crypto');
jest.mock('../../repositories/channelMemberRepository');
jest.mock('../../repositories/channelRepository');
jest.mock('../../repositories/adminRepository', () => ({
  findUserById: jest.fn(),
}));

describe('Channel Member Service', () => {
  let mockUser: { id: number; role: CommunityRole; active: boolean };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 1, role: CommunityRole.admin, active: true };
  });

  describe('checkChannelMemberPermission', () => {
    it('should throw an error if the user is not in the channel or inactive', async () => {
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        channelMemberService.checkChannelMemberPermission(1, 1)
      ).rejects.toThrow('the user is not a member of the channel');
    });

    it('should throw an error if the user is not an admin', async () => {
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue({
        ...mockUser,
        role: CommunityRole.member,
      });

      await expect(
        channelMemberService.checkChannelMemberPermission(1, 1)
      ).rejects.toThrow('Not Authorized');
    });

    it('should pass if the user is an active admin', async () => {
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue(mockUser);

      await expect(
        channelMemberService.checkChannelMemberPermission(1, 1)
      ).resolves.not.toThrow();
    });
  });

  describe('addChannelMember', () => {
    it('should throw an error if the channel does not exist', async () => {
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(null);

      await expect(
        channelMemberService.addChannelMember(1, 1, CommunityRole.member)
      ).rejects.toThrow('this is no channel with this id');
    });

    it('should add a new member if checks pass', async () => {
      // Mock the channel existence
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue({
        id: 1,
      });

      // Mock user check
      (userRepository.findUserById as jest.Mock).mockResolvedValue({ id: 4 });

      // Mock checking existing member (should return null)
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue(null);

      // Mock adding channel member
      const mockNewMember = {
        channelId: 1,
        userId: 4,
        role: CommunityRole.member,
      };
      (channelMemberRepository.addChannelMember as jest.Mock).mockResolvedValue(
        mockNewMember
      );

      const result = await channelMemberService.addChannelMember(
        4,
        1,
        CommunityRole.member
      );

      // Verify all checks and method calls
      expect(channelRepository.findChannelById).toHaveBeenCalledWith(1);
      expect(userRepository.findUserById).toHaveBeenCalledWith(4);
      expect(channelMemberRepository.findExistingMember).toHaveBeenCalledWith(
        4,
        1
      );
      expect(channelMemberRepository.addChannelMember).toHaveBeenCalledWith({
        channelId: 1,
        userId: 4,
        role: CommunityRole.member,
      });

      expect(result).toEqual(mockNewMember);
    });

    it('should reactivate an existing inactive member', async () => {
      // Mock the channel existence
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue({
        id: 1,
      });

      // Mock user check
      (userRepository.findUserById as jest.Mock).mockResolvedValue({ id: 4 });

      // Mock an existing inactive member
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue({
        userId: 4,
        channelId: 1,
        active: false,
      });

      // Mock reactivating the member
      const mockReactivatedMember = {
        channelId: 1,
        userId: 4,
        role: CommunityRole.member,
        active: true,
      };
      (
        channelMemberRepository.updateChannelMemberStatus as jest.Mock
      ).mockResolvedValue(mockReactivatedMember);

      const result = await channelMemberService.addChannelMember(
        4,
        1,
        CommunityRole.member
      );

      expect(
        channelMemberRepository.updateChannelMemberStatus
      ).toHaveBeenCalledWith(4, 1, true);
    });

    it('should throw an error if member already exists and is active', async () => {
      // Mock the channel existence
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue({
        id: 1,
      });

      // Mock user check
      (userRepository.findUserById as jest.Mock).mockResolvedValue({ id: 4 });

      // Mock an existing active member
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue({
        userId: 4,
        channelId: 1,
        active: true,
      });

      await expect(
        channelMemberService.addChannelMember(4, 1, CommunityRole.member)
      ).rejects.toThrow('Member already exists in this channel');
    });
  });

  describe('updateChannelMember', () => {
    it('should throw an error if the channel does not exist', async () => {
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(null);

      await expect(
        channelMemberService.updateChannelMember(1, 1, 2, {})
      ).rejects.toThrow('this is no channel with this id');
    });

    it('should update channel member successfully', async () => {
      // Mock channel existence
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue({
        id: 1,
      });

      // Mock admin check
      (
        channelMemberRepository.findChannelMember as jest.Mock
      ).mockResolvedValue({
        userId: 1,
        role: CommunityRole.admin,
        active: true,
      });

      // Mock existing member
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue({
        userId: 2,
        channelId: 1,
      });

      // Mock update
      const mockUpdatedMember = {
        userId: 2,
        channelId: 1,
        role: CommunityRole.admin,
      };
      (
        channelMemberRepository.updateChannelMemberData as jest.Mock
      ).mockResolvedValue(mockUpdatedMember);

      const result = await channelMemberService.updateChannelMember(1, 1, 2, {
        role: 'admin',
      });

      expect(result).toEqual(mockUpdatedMember);
    });
  });

  describe('deleteChannelMember', () => {
    it('should deactivate the member if they exist', async () => {
      // Mock existing member
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue(mockUser);

      // Mock deactivation
      (
        channelMemberRepository.updateChannelMemberStatus as jest.Mock
      ).mockResolvedValue(true);

      const result = await channelMemberService.deleteChannelMember(1, 2);

      expect(result).toBe(true);
    });

    it('should throw an error if member does not exist', async () => {
      // Mock no existing member
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        channelMemberService.deleteChannelMember(1, 2)
      ).rejects.toThrow('Member not found in this channel');
    });
  });

  describe('joinChannelByInvite', () => {
    it('should throw an error for an invalid token', async () => {
      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_token'),
      });

      (
        channelMemberRepository.findChannelByInvitationLinkHash as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        channelMemberService.joinChannelByInvite(
          'invalid_token',
          1,
          CommunityRole.member
        )
      ).rejects.toThrow('Invalid or expired invitation link');
    });

    it('should add a user to the channel for a valid token', async () => {
      const mockChannel = { id: 1 };
      const mockMember = {
        channelId: 1,
        userId: 2,
        role: CommunityRole.member,
      };

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_token'),
      });

      // Mock user check to pass
      (userRepository.findUserById as jest.Mock).mockResolvedValue({ id: 2 });

      (
        channelMemberRepository.findChannelByInvitationLinkHash as jest.Mock
      ).mockResolvedValue(mockChannel);
      (
        channelMemberRepository.findExistingMember as jest.Mock
      ).mockResolvedValue(null);
      (channelMemberRepository.addChannelMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await channelMemberService.joinChannelByInvite(
        'valid_token',
        2,
        CommunityRole.member
      );

      expect(result).toEqual(mockMember);
    });
  });

  describe('getChannelMembers', () => {
    it('should throw an error if the channel does not exist', async () => {
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(null);

      await expect(channelMemberService.getChannelMembers(1)).rejects.toThrow(
        'this is no channel with this id'
      );
    });

    it('should return channel members if the channel exists', async () => {
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue({
        id: 1,
      });
      (
        channelMemberRepository.findChannelMembers as jest.Mock
      ).mockResolvedValue([
        { id: 1, role: CommunityRole.admin },
        { id: 2, role: CommunityRole.member },
      ]);

      const result = await channelMemberService.getChannelMembers(1);

      expect(result).toEqual([
        { id: 1, role: CommunityRole.admin },
        { id: 2, role: CommunityRole.member },
      ]);
    });
  });
});
