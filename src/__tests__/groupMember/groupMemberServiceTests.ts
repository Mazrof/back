import { CommunityRole } from '@prisma/client';
import * as groupMemberRepository from '../../repositories/groupMemberRepository';
import * as groupService from '../../services/groupService';
import * as userRepository from '../../repositories/adminRepository';
import {
  checkGroupMemberPermission,
  checkGroupMemberExistence,
  checkCapacity,
  checkGroupAdmin,
  checkUser,
  checkGroupMember,
  getGroupMembers,
  addGroupMember,
  addGroupCreator,
  updateGroupMember,
  deleteGroupMember,
  joinGroupByInvite,
} from '../../services/groupMemberService';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

jest.mock('../../repositories/groupMemberRepository');
jest.mock('../../services/groupService');
jest.mock('../../repositories/adminRepository');

describe('Group Member Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkGroupMemberPermission', () => {
    it('should pass for active admin member', async () => {
      const mockMember = {
        active: true,
        role: CommunityRole.admin,
      };
      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      await expect(checkGroupMemberPermission(1, 1)).resolves.not.toThrow();
    });

    it('should throw error for inactive member', async () => {
      const mockMember = {
        active: false,
        role: CommunityRole.admin,
      };
      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      await expect(checkGroupMemberPermission(1, 1)).rejects.toThrow(
        'This user is not part of the group'
      );
    });

    it('should throw error for non-admin member', async () => {
      const mockMember = {
        active: true,
        role: CommunityRole.member,
      };
      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      await expect(checkGroupMemberPermission(1, 1)).rejects.toThrow(
        'Not Authorized'
      );
    });
  });

  describe('checkGroupAdmin', () => {
    it('should pass for valid admin', async () => {
      const mockAdmin = {
        active: true,
        role: CommunityRole.admin,
      };
      (groupMemberRepository.findGroupMember as jest.Mock).mockResolvedValue(
        mockAdmin
      );

      await expect(checkGroupAdmin(1, 1)).resolves.not.toThrow();
    });

    it('should throw error for missing adminId', async () => {
      await expect(checkGroupAdmin(undefined, 1)).rejects.toThrow(
        'AdminId is missing'
      );
    });

    it('should throw error for non-admin user', async () => {
      const mockMember = {
        active: true,
        role: CommunityRole.member,
      };
      (groupMemberRepository.findGroupMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      await expect(checkGroupAdmin(1, 1)).rejects.toThrow('Not Authorized');
    });
  });

  describe('addGroupMember', () => {
    const mockMember = {
      userId: 2,
      groupId: 1,
      role: CommunityRole.member,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
    };

    beforeEach(() => {
      // Mock admin authorization check
      (groupMemberRepository.findGroupMember as jest.Mock).mockResolvedValue({
        active: true,
        role: CommunityRole.admin,
      });
      // Mock group existence check
      (groupService.findGroupById as jest.Mock).mockResolvedValue({ id: 1 });
      // Mock capacity check
      (groupMemberRepository.getGroupSize as jest.Mock).mockResolvedValue({
        groupSize: 10,
      });
      (groupMemberRepository.getMembersCount as jest.Mock).mockResolvedValue(5);
      // Mock user existence check
      (userRepository.findUserById as jest.Mock).mockResolvedValue({ id: 2 });
    });

    it('should add new member successfully', async () => {
      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        null
      );
      (groupMemberRepository.addGroupMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await addGroupMember(
        1,
        1,
        2,
        CommunityRole.member,
        true,
        true
      );

      expect(result).toEqual(mockMember);
    });

    it('should reactivate inactive member', async () => {
      const inactiveMember = { ...mockMember, active: false };
      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        inactiveMember
      );
      (
        groupMemberRepository.updateGroupMemberStatus as jest.Mock
      ).mockResolvedValue(mockMember);
      (
        groupMemberRepository.updateGroupMemberData as jest.Mock
      ).mockResolvedValue(mockMember);

      const result = await addGroupMember(
        1,
        1,
        2,
        CommunityRole.member,
        true,
        true
      );

      expect(result).toEqual(mockMember);
    });
  });

  describe('updateGroupMember', () => {
    beforeEach(() => {
      // Mock admin authorization check
      (groupMemberRepository.findGroupMember as jest.Mock).mockResolvedValue({
        active: true,
        role: CommunityRole.admin,
      });
      // Mock group existence check
      (groupService.findGroupById as jest.Mock).mockResolvedValue({ id: 1 });
    });

    it('should update member successfully', async () => {
      const mockMember = {
        userId: 2,
        groupId: 1,
        role: CommunityRole.member,
        active: true,
      };

      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        mockMember
      );
      (
        groupMemberRepository.updateGroupMemberData as jest.Mock
      ).mockResolvedValue({
        ...mockMember,
        role: CommunityRole.admin,
      });

      const result = await updateGroupMember(1, 1, 2, {
        role: CommunityRole.admin,
      });

      expect(result.role).toBe(CommunityRole.admin);
    });

    it('should prevent removing last admin', async () => {
      const adminMember = {
        userId: 2,
        groupId: 1,
        role: CommunityRole.admin,
        active: true,
      };

      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        adminMember
      );
      (
        groupMemberRepository.getGroupAdminCounts as jest.Mock
      ).mockResolvedValue(1);

      await expect(
        updateGroupMember(1, 1, 2, { role: CommunityRole.member })
      ).rejects.toThrow('Group should have at least one admin');
    });

    it('should throw error when no data to update', async () => {
      await expect(updateGroupMember(1, 1, 2, {})).rejects.toThrow(
        'No data to update'
      );
    });
  });

  describe('deleteGroupMember', () => {
    beforeEach(() => {
      // Mock admin authorization check
      (groupMemberRepository.findGroupMember as jest.Mock).mockResolvedValue({
        active: true,
        role: CommunityRole.admin,
      });
      // Mock group existence check
      (groupService.findGroupById as jest.Mock).mockResolvedValue({ id: 1 });
    });

    it('should delete regular member successfully', async () => {
      const mockMember = {
        userId: 2,
        groupId: 1,
        role: CommunityRole.member,
        active: true,
      };

      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        mockMember
      );
      (
        groupMemberRepository.updateGroupMemberStatus as jest.Mock
      ).mockResolvedValue(null);

      const result = await deleteGroupMember(1, 1, 2);

      expect(result).toBeNull();
    });

    it('should delete last admin and group', async () => {
      const adminMember = {
        userId: 2,
        groupId: 1,
        role: CommunityRole.admin,
        active: true,
      };

      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        adminMember
      );
      (
        groupMemberRepository.getGroupAdminCounts as jest.Mock
      ).mockResolvedValue(1);
      (groupMemberRepository.findGroupMembers as jest.Mock).mockResolvedValue([
        adminMember,
      ]);
      (groupService.deleteGroup as jest.Mock).mockResolvedValue(null);

      const result = await deleteGroupMember(2, 1, 2);

      expect(result).toBeNull();
      expect(groupService.deleteGroup).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('joinGroupByInvite', () => {
    it('should join group with valid invite', async () => {
      const mockGroup = {
        id: 1,
        community: { active: true },
      };

      (
        groupMemberRepository.findGroupByInvitationLinkHash as jest.Mock
      ).mockResolvedValue(mockGroup);
      (userRepository.findUserById as jest.Mock).mockResolvedValue({ id: 2 });
      (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
        null
      );
      (groupMemberRepository.addGroupMember as jest.Mock).mockResolvedValue({
        userId: 2,
        groupId: 1,
        role: CommunityRole.member,
        hasDownloadPermissions: false,
        hasMessagePermissions: false,
      });

      const result = await joinGroupByInvite('valid-token', 2);

      expect(result.role).toBe(CommunityRole.member);
    });

    it('should throw error for invalid invite', async () => {
      (
        groupMemberRepository.findGroupByInvitationLinkHash as jest.Mock
      ).mockResolvedValue(null);

      await expect(joinGroupByInvite('invalid-token', 2)).rejects.toThrow(
        'Invalid invitation link'
      );
    });
  });
});
