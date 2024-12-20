import prisma from '../../prisma/client';
import { CommunityRole } from '@prisma/client';
import {
  findChannelMember,
  findChannelMembers,
  findExistingMember,
  addChannelMember,
  updateChannelMember,
  findChannelByInvitationLinkHash,
  getChannelAdminCounts,
} from '../../repositories/channelMemberRepository';

// Mock the prisma client
jest.mock('../../prisma/client', () => ({
  __esModule: true,
  default: {
    channels: {
      findUnique: jest.fn(),
    },
    channelSubscriptions: {
      count: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Channel Membership Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findChannelMember', () => {
    const mockMember = {
      role: CommunityRole.member,
      active: true,
    };

    it('should return member details when found', async () => {
      (prisma.channelSubscriptions.findUnique as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await findChannelMember(1, 1);

      expect(result).toEqual(mockMember);
      expect(prisma.channelSubscriptions.findUnique).toHaveBeenCalledWith({
        where: {
          userId_channelId: { userId: 1, channelId: 1 },
        },
        select: {
          role: true,
          active: true,
        },
      });
    });

    it('should return null when member not found', async () => {
      (prisma.channelSubscriptions.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      const result = await findChannelMember(999, 999);

      expect(result).toBeNull();
    });
  });

  describe('findChannelMembers', () => {
    const mockMembers = [
      {
        channelId: 1,
        userId: 1,
        role: CommunityRole.admin,
        active: true,
        hasDownloadPermissions: true,
        users: { username: 'user1' },
      },
      {
        channelId: 1,
        userId: 2,
        role: CommunityRole.member,
        active: true,
        hasDownloadPermissions: false,
        users: { username: 'user2' },
      },
    ];

    it('should return all active channel members', async () => {
      (prisma.channelSubscriptions.findMany as jest.Mock).mockResolvedValue(
        mockMembers
      );

      const result = await findChannelMembers(1);

      expect(result).toEqual(mockMembers);
      expect(prisma.channelSubscriptions.findMany).toHaveBeenCalledWith({
        where: {
          channelId: 1,
          active: true,
        },
        select: {
          channelId: true,
          userId: true,
          role: true,
          active: true,
          hasDownloadPermissions: true,
          users: {
            select: {
              username: true,
            },
          },
        },
      });
    });
  });

  describe('findExistingMember', () => {
    const mockExistingMember = {
      role: CommunityRole.member,
      active: true,
      hasDownloadPermissions: true,
      userId: 1,
      channelId: 1,
    };

    it('should return member details when found', async () => {
      (prisma.channelSubscriptions.findUnique as jest.Mock).mockResolvedValue(
        mockExistingMember
      );

      const result = await findExistingMember(1, 1);

      expect(result).toEqual(mockExistingMember);
      expect(prisma.channelSubscriptions.findUnique).toHaveBeenCalledWith({
        where: {
          userId_channelId: { userId: 1, channelId: 1 },
        },
        select: {
          role: true,
          hasDownloadPermissions: true,
          active: true,
          channelId: true,
          userId: true,
        },
      });
    });
  });

  describe('addChannelMember', () => {
    const mockMemberData = {
      channelId: 1,
      userId: 1,
      role: CommunityRole.member,
      hasDownloadPermissions: true,
    };

    it('should create new channel member', async () => {
      (prisma.channelSubscriptions.create as jest.Mock).mockResolvedValue(
        mockMemberData
      );

      const result = await addChannelMember(mockMemberData);

      expect(result).toEqual(mockMemberData);
      expect(prisma.channelSubscriptions.create).toHaveBeenCalledWith({
        data: mockMemberData,
        select: {
          channelId: true,
          userId: true,
          role: true,
          hasDownloadPermissions: true,
        },
      });
    });
  });

  describe('updateChannelMember', () => {
    const mockUpdatedMember = {
      active: true,
      role: CommunityRole.admin,
      hasDownloadPermissions: true,
      userId: 1,
      channelId: 1,
    };

    it('should update member with all fields', async () => {
      const updateData = {
        role: CommunityRole.admin,
        hasDownloadPermissions: true,
        active: true,
      };

      (prisma.channelSubscriptions.update as jest.Mock).mockResolvedValue(
        mockUpdatedMember
      );

      const result = await updateChannelMember(1, 1, updateData);

      expect(result).toEqual(mockUpdatedMember);
      expect(prisma.channelSubscriptions.update).toHaveBeenCalledWith({
        where: {
          userId_channelId: { userId: 1, channelId: 1 },
        },
        data: updateData,
        select: {
          active: true,
          role: true,
          hasDownloadPermissions: true,
          userId: true,
          channelId: true,
        },
      });
    });

    it('should update member with partial fields', async () => {
      const updateData = { role: CommunityRole.admin };

      (prisma.channelSubscriptions.update as jest.Mock).mockResolvedValue(
        mockUpdatedMember
      );

      const result = await updateChannelMember(1, 1, updateData);

      expect(result).toEqual(mockUpdatedMember);
      expect(prisma.channelSubscriptions.update).toHaveBeenCalledWith({
        where: {
          userId_channelId: { userId: 1, channelId: 1 },
        },
        data: updateData,
        select: {
          active: true,
          role: true,
          hasDownloadPermissions: true,
          userId: true,
          channelId: true,
        },
      });
    });
  });

  describe('findChannelByInvitationLinkHash', () => {
    const mockChannel = {
      id: 1,
      community: { active: true },
    };

    it('should return channel when found by invitation link', async () => {
      (prisma.channels.findUnique as jest.Mock).mockResolvedValue(mockChannel);

      const result = await findChannelByInvitationLinkHash('test-hash');

      expect(result).toEqual(mockChannel);
      expect(prisma.channels.findUnique).toHaveBeenCalledWith({
        where: { invitationLink: 'test-hash' },
        select: {
          id: true,
          community: {
            select: { active: true },
          },
        },
      });
    });

    it('should return null when channel not found', async () => {
      (prisma.channels.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findChannelByInvitationLinkHash('invalid-hash');

      expect(result).toBeNull();
    });
  });

  describe('getChannelAdminCounts', () => {
    it('should return count of active admin members', async () => {
      (prisma.channelSubscriptions.count as jest.Mock).mockResolvedValue(2);

      const result = await getChannelAdminCounts(1);

      expect(result).toBe(2);
      expect(prisma.channelSubscriptions.count).toHaveBeenCalledWith({
        where: {
          channelId: 1,
          role: CommunityRole.admin,
          active: true,
        },
      });
    });
  });
});
