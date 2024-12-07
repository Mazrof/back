import * as groupRepository from '../../repositories/groupRepository';
import * as groupMemberRepository from '../../repositories/groupMemberRepository';
import * as groupMemberService from '../../services/groupMemberService';
import {
  generateInviteToken,
  checkPermission,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../../services/groupService';
import { CommunityRole } from '@prisma/client';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

// Mock dependencies
jest.mock('../../repositories/groupRepository', () => ({
  findAllGroups: jest.fn(),
  findGroupById: jest.fn(),
  createGroup: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
  applyGroupFilter: jest.fn(),
}));

jest.mock('../../repositories/groupMemberRepository', () => ({
  addGroupMember: jest.fn(),
}));

jest.mock('../../services/groupMemberService', () => ({
  checkGroupMemberPermission: jest.fn(),
  addGroupMember: jest.fn(),
}));

describe('Group Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a group and add members', async () => {
      const mockData = {
        name: 'Test Group',
        privacy: true,
        creatorId: 1,
        groupSize: 100,
        admins: [2, 3],
      };

      const mockGroup = {
        id: 1,
        groupSize: 100,
        community: { name: 'Test Group', privacy: true },
      };

      (groupRepository.createGroup as jest.Mock).mockResolvedValue(mockGroup);
      (groupMemberRepository.addGroupMember as jest.Mock).mockResolvedValue(
        undefined
      );
      (groupMemberService.addGroupMember as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await createGroup(mockData);

      expect(result).toEqual(mockGroup);
      expect(groupRepository.createGroup).toHaveBeenCalledWith({
        ...mockData,
        invitationLink: expect.any(String), // This will be a hashed invite token
      });
      expect(groupMemberRepository.addGroupMember).toHaveBeenCalledWith({
        groupId: mockGroup.id,
        userId: mockData.creatorId,
        role: CommunityRole.admin,
      });
      expect(groupMemberService.addGroupMember).toHaveBeenCalledTimes(
        mockData.admins.length
      );
      mockData.admins.forEach((admin) => {
        expect(groupMemberService.addGroupMember).toHaveBeenCalledWith(
          mockData.creatorId,
          mockGroup.id,
          admin,
          CommunityRole.admin
        );
      });
    });
  });

  describe('updateGroup', () => {
    it('should update a group if the admin has permission', async () => {
      const mockData = { name: 'Updated Group', privacy: false };
      const mockGroup = {
        id: 1,
        groupSize: 100,
        community: { name: 'Updated Group', privacy: false },
      };
      const adminId = 1;
      const groupId = 1;

      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockResolvedValue(undefined);
      (groupRepository.updateGroup as jest.Mock).mockResolvedValue(mockGroup);

      const result = await updateGroup(groupId, adminId, mockData);

      expect(result).toEqual(mockGroup);
      expect(
        groupMemberService.checkGroupMemberPermission
      ).toHaveBeenCalledWith(adminId, groupId);
      expect(groupRepository.updateGroup).toHaveBeenCalledWith(
        groupId,
        mockData
      );
    });

    it('should throw error if the admin does not have permission', async () => {
      const mockData = { name: 'Updated Group', privacy: false };
      const adminId = 1;
      const groupId = 1;

      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockRejectedValue(new Error('Permission denied'));

      await expect(updateGroup(groupId, adminId, mockData)).rejects.toThrow(
        'Permission denied'
      );
      expect(
        groupMemberService.checkGroupMemberPermission
      ).toHaveBeenCalledWith(adminId, groupId);
      expect(groupRepository.updateGroup).not.toHaveBeenCalled();
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group if the admin has permission', async () => {
      const groupId = 1;
      const adminId = 1;

      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockResolvedValue(undefined);
      (groupRepository.deleteGroup as jest.Mock).mockResolvedValue({
        communityId: 1,
      });

      const result = await deleteGroup(groupId, adminId);

      expect(result).toEqual({ communityId: 1 });
      expect(
        groupMemberService.checkGroupMemberPermission
      ).toHaveBeenCalledWith(adminId, groupId);
      expect(groupRepository.deleteGroup).toHaveBeenCalledWith(groupId);
    });

    it('should throw error if the admin does not have permission', async () => {
      const groupId = 1;
      const adminId = 1;

      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockRejectedValue(new Error('Permission denied'));

      await expect(deleteGroup(groupId, adminId)).rejects.toThrow(
        'Permission denied'
      );
      expect(
        groupMemberService.checkGroupMemberPermission
      ).toHaveBeenCalledWith(adminId, groupId);
      expect(groupRepository.deleteGroup).not.toHaveBeenCalled();
    });
  });

  describe('generateInviteToken', () => {
    it('should generate a valid token', () => {
      const token = generateInviteToken();
      expect(token).toHaveLength(64); // 32 bytes * 2 for hex
    });
  });

  describe('checkPermission', () => {
    it('should call checkGroupMemberPermission with correct params', async () => {
      const adminId = 1;
      const groupId = 1;

      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockResolvedValue(undefined);

      await checkPermission(adminId, groupId);

      expect(
        groupMemberService.checkGroupMemberPermission
      ).toHaveBeenCalledWith(adminId, groupId);
    });
  });
});
