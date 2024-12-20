import prisma from '../../prisma/client';
import { CommunityRole } from '@prisma/client';
import {
  getGroupSize,
  getMembersCount,
  findGroupMember,
  findGroupMembers,
  findExistingMember,
  addGroupMember,
  updateGroupMemberStatus,
  updateGroupMemberData,
  findGroupByInvitationLinkHash,
  getGroupAdminCounts,
} from '../../repositories/groupMemberRepository';

// Mock the prisma client
jest.mock('../../prisma/client', () => ({
  __esModule: true,
  default: {
    groups: {
      findUnique: jest.fn(),
    },
    groupMemberships: {
      count: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Group Membership Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGroupSize', () => {
    it('should return group size when group exists', async () => {
      const mockSize = { groupSize: 10 };
      (prisma.groups.findUnique as jest.Mock).mockResolvedValue(mockSize);

      const result = await getGroupSize(1);

      expect(result).toEqual(mockSize);
      expect(prisma.groups.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { groupSize: true },
      });
    });

    it('should return null when group does not exist', async () => {
      (prisma.groups.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getGroupSize(999);

      expect(result).toBeNull();
      expect(prisma.groups.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: { groupSize: true },
      });
    });
  });

  describe('getMembersCount', () => {
    it('should return count of active members', async () => {
      (prisma.groupMemberships.count as jest.Mock).mockResolvedValue(5);

      const result = await getMembersCount(1);

      expect(result).toBe(5);
      expect(prisma.groupMemberships.count).toHaveBeenCalledWith({
        where: { AND: { groupId: 1, active: true } },
      });
    });
  });

  describe('findGroupMember', () => {
    const mockMember = {
      role: CommunityRole.member,
      active: true,
      hasMessagePermissions: true,
      hasDownloadPermissions: true,
    };

    it('should return member details when found', async () => {
      (prisma.groupMemberships.findUnique as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await findGroupMember(1, 1);

      expect(result).toEqual(mockMember);
      expect(prisma.groupMemberships.findUnique).toHaveBeenCalledWith({
        where: {
          userId_groupId: { userId: 1, groupId: 1 },
        },
        select: {
          role: true,
          active: true,
          hasMessagePermissions: true,
          hasDownloadPermissions: true,
        },
      });
    });

    it('should return null when member not found', async () => {
      (prisma.groupMemberships.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findGroupMember(999, 999);

      expect(result).toBeNull();
    });
  });

  describe('findGroupMembers', () => {
    const mockMembers = [
      {
        groupId: 1,
        userId: 1,
        role: CommunityRole.admin,
        active: true,
        hasDownloadPermissions: true,
        hasMessagePermissions: true,
        users: { username: 'user1' },
      },
      {
        groupId: 1,
        userId: 2,
        role: CommunityRole.member,
        active: true,
        hasDownloadPermissions: false,
        hasMessagePermissions: true,
        users: { username: 'user2' },
      },
    ];

    it('should return all group members', async () => {
      (prisma.groupMemberships.findMany as jest.Mock).mockResolvedValue(
        mockMembers
      );

      const result = await findGroupMembers(1);

      expect(result).toEqual(mockMembers);
      expect(prisma.groupMemberships.findMany).toHaveBeenCalledWith({
        where: { groupId: 1 },
        select: {
          groupId: true,
          userId: true,
          role: true,
          active: true,
          hasDownloadPermissions: true,
          hasMessagePermissions: true,
          users: { select: { username: true } },
        },
      });
    });
  });

  describe('findExistingMember', () => {
    const mockExistingMember = {
      role: CommunityRole.member,
      active: true,
      hasMessagePermissions: true,
      hasDownloadPermissions: true,
      userId: 1,
      groupId: 1,
    };

    it('should return member details when found', async () => {
      (prisma.groupMemberships.findUnique as jest.Mock).mockResolvedValue(
        mockExistingMember
      );

      const result = await findExistingMember(1, 1);

      expect(result).toEqual(mockExistingMember);
      expect(prisma.groupMemberships.findUnique).toHaveBeenCalledWith({
        where: {
          userId_groupId: { userId: 1, groupId: 1 },
        },
        select: {
          role: true,
          active: true,
          hasMessagePermissions: true,
          hasDownloadPermissions: true,
          userId: true,
          groupId: true,
        },
      });
    });
  });

  describe('addGroupMember', () => {
    const mockMemberData = {
      groupId: 1,
      userId: 1,
      role: CommunityRole.member,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
    };

    it('should create new group member', async () => {
      (prisma.groupMemberships.create as jest.Mock).mockResolvedValue(
        mockMemberData
      );

      const result = await addGroupMember(mockMemberData);

      expect(result).toEqual(mockMemberData);
      expect(prisma.groupMemberships.create).toHaveBeenCalledWith({
        data: mockMemberData,
        select: {
          groupId: true,
          userId: true,
          role: true,
          hasDownloadPermissions: true,
          hasMessagePermissions: true,
        },
      });
    });
  });

  describe('updateGroupMemberStatus', () => {
    const mockUpdatedMember = {
      userId: 1,
      groupId: 1,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
      role: CommunityRole.member,
    };

    it('should update member status', async () => {
      (prisma.groupMemberships.update as jest.Mock).mockResolvedValue(
        mockUpdatedMember
      );

      const result = await updateGroupMemberStatus(1, 1, false);

      expect(result).toEqual(mockUpdatedMember);
      expect(prisma.groupMemberships.update).toHaveBeenCalledWith({
        where: {
          userId_groupId: { userId: 1, groupId: 1 },
        },
        data: { active: false },
        select: {
          userId: true,
          groupId: true,
          hasDownloadPermissions: true,
          hasMessagePermissions: true,
          role: true,
        },
      });
    });
  });

  describe('updateGroupMemberData', () => {
    const mockUpdatedMember = {
      userId: 1,
      groupId: 1,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
      role: CommunityRole.admin,
    };

    it('should update member data with all fields', async () => {
      const updateData = {
        role: CommunityRole.admin,
        hasMessagePermissions: true,
        hasDownloadPermissions: true,
      };

      (prisma.groupMemberships.update as jest.Mock).mockResolvedValue(
        mockUpdatedMember
      );

      const result = await updateGroupMemberData(1, 1, updateData);

      expect(result).toEqual(mockUpdatedMember);
      expect(prisma.groupMemberships.update).toHaveBeenCalledWith({
        where: {
          userId_groupId: { userId: 1, groupId: 1 },
        },
        data: updateData,
        select: {
          userId: true,
          groupId: true,
          hasDownloadPermissions: true,
          hasMessagePermissions: true,
          role: true,
        },
      });
    });

    it('should update member data with partial fields', async () => {
      const updateData = { role: CommunityRole.admin };

      (prisma.groupMemberships.update as jest.Mock).mockResolvedValue(
        mockUpdatedMember
      );

      const result = await updateGroupMemberData(1, 1, updateData);

      expect(result).toEqual(mockUpdatedMember);
      expect(prisma.groupMemberships.update).toHaveBeenCalledWith({
        where: {
          userId_groupId: { userId: 1, groupId: 1 },
        },
        data: updateData,
        select: {
          userId: true,
          groupId: true,
          hasDownloadPermissions: true,
          hasMessagePermissions: true,
          role: true,
        },
      });
    });
  });

  describe('findGroupByInvitationLinkHash', () => {
    const mockGroup = {
      id: 1,
      community: { active: true },
    };

    it('should return group when found by invitation link', async () => {
      (prisma.groups.findUnique as jest.Mock).mockResolvedValue(mockGroup);

      const result = await findGroupByInvitationLinkHash('test-hash');

      expect(result).toEqual(mockGroup);
      expect(prisma.groups.findUnique).toHaveBeenCalledWith({
        where: { invitationLink: 'test-hash' },
        select: {
          id: true,
          community: { select: { active: true } },
        },
      });
    });

    it('should return null when group not found', async () => {
      (prisma.groups.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findGroupByInvitationLinkHash('invalid-hash');

      expect(result).toBeNull();
    });
  });

  describe('getGroupAdminCounts', () => {
    it('should return count of active admin members', async () => {
      (prisma.groupMemberships.count as jest.Mock).mockResolvedValue(2);

      const result = await getGroupAdminCounts(1);

      expect(result).toBe(2);
      expect(prisma.groupMemberships.count).toHaveBeenCalledWith({
        where: {
          groupId: 1,
          role: CommunityRole.admin,
          active: true,
        },
      });
    });
  });
});
