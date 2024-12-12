import prisma from '../../prisma/client';
import {
  getMembersCount,
  findGroupMember,
  findGroupMembers,
  findExistingMember,
  addGroupMember,
  updateGroupMemberStatus,
  updateGroupMemberData,
  findGroupByInvitationLinkHash,
} from '../../repositories/groupMemberRepository';
import { CommunityRole } from '@prisma/client';

jest.mock('../../prisma/client', () => ({
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
}));

describe('Group Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMembersCount', () => {
    it('should return true if member count matches group size', async () => {
      (prisma.groups.findUnique as jest.Mock).mockResolvedValue({
        groupSize: 5,
      });
      (prisma.groupMemberships.count as jest.Mock).mockResolvedValue(5);

      const result = await getMembersCount(1);
      expect(result).toBe(true);
      expect(prisma.groups.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { groupSize: true },
      });
      expect(prisma.groupMemberships.count).toHaveBeenCalledWith({
        where: {
          AND: { groupId: 1, active: true },
        },
      });
    });

    it('should return false if member count does not match group size', async () => {
      (prisma.groups.findUnique as jest.Mock).mockResolvedValue({
        groupSize: 5,
      });
      (prisma.groupMemberships.count as jest.Mock).mockResolvedValue(3);

      const result = await getMembersCount(1);
      expect(result).toBe(false);
    });
  });

  describe('findGroupMember', () => {
    it('should find a specific group member', async () => {
      const mockMember = {
        role: CommunityRole.admin,
        active: true,
        hasDownloadPermissions: true,
        hasMessagePermissions: true,
      };
      (prisma.groupMemberships.findUnique as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await findGroupMember(1, 2);
      expect(result).toEqual(mockMember);
      expect(prisma.groupMemberships.findUnique).toHaveBeenCalledWith({
        where: { userId_groupId: { userId: 1, groupId: 2 } },
        select: {
          role: true,
          active: true,
          hasDownloadPermissions: true,
          hasMessagePermissions: true,
        },
      });
    });
  });

  describe('findGroupMembers', () => {
    it('should return all active group members', async () => {
      const mockMembers = [
        {
          groupId: 1,
          userId: 2,
          role: CommunityRole.admin,
          active: true,
          hasDownloadPermissions: true,
          hasMessagePermissions: true,
          users: { username: 'test_user' },
        },
      ];
      (prisma.groupMemberships.findMany as jest.Mock).mockResolvedValue(
        mockMembers
      );

      const result = await findGroupMembers(1);
      expect(result).toEqual(mockMembers);
      expect(prisma.groupMemberships.findMany).toHaveBeenCalledWith({
        where: { groupId: 1, active: true },
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
    it('should return existing member data', async () => {
      const mockMember = {
        role: CommunityRole.admin,
        hasMessagePermissions: true,
        hasDownloadPermissions: true,
        active: true,
      };
      (prisma.groupMemberships.findUnique as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await findExistingMember(1, 2);
      expect(result).toEqual(mockMember);
    });
  });

  describe('addGroupMember', () => {
    it('should add a new group member', async () => {
      const mockData = {
        groupId: 1,
        userId: 2,
        role: CommunityRole.member,
        hasMessagePermissions: true,
        hasDownloadPermissions: true,
      };
      (prisma.groupMemberships.create as jest.Mock).mockResolvedValue(mockData);

      const result = await addGroupMember(mockData);
      expect(result).toEqual(mockData);
      expect(prisma.groupMemberships.create).toHaveBeenCalledWith({
        data: mockData,
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
    it('should update a group member status', async () => {
      const mockData = { userId: 2, groupId: 1, active: false };
      (prisma.groupMemberships.update as jest.Mock).mockResolvedValue(mockData);

      const result = await updateGroupMemberStatus(2, 1, false);
      expect(result).toEqual(mockData);
      expect(prisma.groupMemberships.update).toHaveBeenCalledWith({
        where: { userId_groupId: { userId: 2, groupId: 1 } },
        data: { active: false },
      });
    });
  });

  describe('updateGroupMemberData', () => {
    it('should update group member data', async () => {
      const mockData = { role: CommunityRole.admin };
      (prisma.groupMemberships.update as jest.Mock).mockResolvedValue(mockData);

      const result = await updateGroupMemberData(2, 1, mockData);
      expect(result).toEqual(mockData);
      expect(prisma.groupMemberships.update).toHaveBeenCalledWith({
        where: { userId_groupId: { userId: 2, groupId: 1 } },
        data: mockData,
      });
    });
  });

  describe('findGroupByInvitationLinkHash', () => {
    it('should find a group by invitation link hash', async () => {
      const mockGroup = { id: 1 };
      (prisma.groups.findUnique as jest.Mock).mockResolvedValue(mockGroup);

      const result = await findGroupByInvitationLinkHash('invitation_hash');
      expect(result).toEqual(mockGroup);
      expect(prisma.groups.findUnique).toHaveBeenCalledWith({
        where: { invitationLink: 'invitation_hash' },
        select: { id: true },
      });
    });
  });
});
