jest.mock('firebase-admin');

import { CommunityRole } from '@prisma/client';
import * as groupRepository from '../../repositories/groupRepository';
import * as communityRepository from '../../repositories/communityRepository';
import * as groupMemberService from '../../services/groupMemberService';
import generateInvitationLink from '../../utility/invitationLink';
import {
  getFileFromFirebase,
  uploadFileToFirebase,
} from '../../third_party_services';
import {
  findAllGroups,
  findGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  applyGroupFilter,
} from '../../services/groupService';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

// Mock all dependencies
jest.mock('../../repositories/groupRepository');
jest.mock('../../repositories/communityRepository');
jest.mock('../../services/groupMemberService');
jest.mock('../../services/groupService');
jest.mock('../../utility/invitationLink');
jest.mock('../../third_party_services');

describe('Group Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllGroups', () => {
    const mockGroups = [
      {
        id: 1,
        groupSize: 10,
        community: { name: 'Group 1', privacy: true, imageURL: 'url1' },
        adminGroupFilters: { groupId: 1 },
      },
      {
        id: 2,
        groupSize: 20,
        community: { name: 'Group 2', privacy: false, imageURL: 'url2' },
        adminGroupFilters: null,
      },
    ];

    it('should return all groups with filter status', async () => {
      (groupRepository.findAllGroups as jest.Mock).mockResolvedValue(
        mockGroups
      );

      const result = await findAllGroups();

      expect(result).toEqual([
        {
          id: 1,
          groupSize: 10,
          community: { name: 'Group 1', privacy: true, imageURL: 'url1' },
          hasFilter: true,
        },
        {
          id: 2,
          groupSize: 20,
          community: { name: 'Group 2', privacy: false, imageURL: 'url2' },
          hasFilter: false,
        },
      ]);
      expect(groupRepository.findAllGroups).toHaveBeenCalled();
    });
  });

  describe('findGroupById', () => {
    const mockGroup = {
      id: 1,
      communityId: 1,
      community: {
        name: 'Test Group',
        privacy: true,
        imageURL: 'url',
        active: true,
      },
      groupSize: 10,
      adminGroupFilters: null,
    };

    it('should return group by id', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);

      const result = await findGroupById(1);

      expect(result).toEqual({
        id: 1,
        communityId: 1,
        community: { name: 'Test Group', privacy: true, imageURL: 'url' },
        groupSize: 10,
        hasFilter: false,
      });
      expect(groupRepository.findGroupById).toHaveBeenCalledWith(1);
    });

    it('should throw error if group not found', async () => {
      // Mock the asynchronous method to return null
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(null);

      // Wrap the function call in a Promise to ensure it's a promise
      await expect(Promise.resolve(findGroupById(999))).rejects.toThrow('No Group found with that ID');
    });



    it('should throw error if community is inactive', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue({
        ...mockGroup,
        community: { ...mockGroup.community, active: false },
      });

      await expect(findGroupById(1)).rejects.toThrow(
        'No Group found with that ID'
      );
    });
  });

  describe('createGroup', () => {
    const mockGroupData = {
      name: 'New Group',
      privacy: true,
      creatorId: 1,
      groupSize: 10,
      imageURL: 'test-url',
    };

    const mockCreatedGroup = {
      id: 1,
      community: { name: 'New Group', privacy: true, imageURL: 'firebase-url' },
      groupSize: 10,
    };

    it('should create a new group successfully', async () => {
      (uploadFileToFirebase as jest.Mock).mockResolvedValue('firebase-url');
      (generateInvitationLink as jest.Mock).mockReturnValue('invitation-link');
      (groupRepository.createGroup as jest.Mock).mockResolvedValue(
        mockCreatedGroup
      );
      (getFileFromFirebase as jest.Mock).mockResolvedValue('firebase-url');

      const result = await createGroup(mockGroupData);

      expect(result).toEqual(mockCreatedGroup);
      expect(uploadFileToFirebase).toHaveBeenCalledWith('test-url');
      expect(generateInvitationLink).toHaveBeenCalled();
      expect(groupRepository.createGroup).toHaveBeenCalledWith({
        ...mockGroupData,
        imageURL: 'firebase-url',
        invitationLink: 'invitation-link',
      });
      expect(groupMemberService.addGroupCreator).toHaveBeenCalledWith(
        1,
        1,
        CommunityRole.admin
      );
    });

    it('should throw error for invalid group name', async () => {
      await expect(createGroup({ ...mockGroupData, name: '' })).rejects.toThrow(
        'Invalid Group name'
      );
    });

    it('should throw error for invalid creator ID', async () => {
      await expect(
        createGroup({ ...mockGroupData, creatorId: 0 })
      ).rejects.toThrow('Invalid Creator ID');
    });

    it('should throw error for invalid group size', async () => {
      await expect(
        createGroup({ ...mockGroupData, groupSize: 0 })
      ).rejects.toThrow('Invalid Group size');
    });
  });

  describe('updateGroup', () => {
    const mockGroup = {
      id: 1,
      communityId: 1,
      community: { name: 'Test Group', privacy: true, imageURL: 'url' },
      groupSize: 10,
    };

    const mockUpdateData = {
      name: 'Updated Group',
      privacy: false,
      groupSize: 15,
      imageURL: 'new-url',
    };

    it('should update group successfully', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (uploadFileToFirebase as jest.Mock).mockResolvedValue('firebase-url');
      (groupRepository.getGroupSize as jest.Mock).mockResolvedValue(5);
      (groupRepository.updateGroup as jest.Mock).mockResolvedValue({
        ...mockGroup,
        ...mockUpdateData,
        community: { ...mockGroup.community, imageURL: 'firebase-url' },
      });
      (getFileFromFirebase as jest.Mock).mockResolvedValue('firebase-url');

      const result = await updateGroup(1, 1, mockUpdateData);

      expect(result.community.name).toBe('Updated Group');
      expect(result.groupSize).toBe(15);
      expect(uploadFileToFirebase).toHaveBeenCalledWith('new-url');
      expect(communityRepository.updateCommunity).toHaveBeenCalled();
      expect(groupRepository.updateGroup).toHaveBeenCalled();
    });

    it('should throw error if no update data provided', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockResolvedValue(true);

      await expect(updateGroup(1, 1, {})).rejects.toThrow('No data to update');
    });

    it('should throw error if new group size is less than current member count', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockResolvedValue(true);
      (groupRepository.getGroupSize as jest.Mock).mockResolvedValue(20);

      await expect(updateGroup(1, 1, { groupSize: 10 })).rejects.toThrow(
        'Invalid Group Size Limit'
      );
    });
  });

  describe('deleteGroup', () => {
    const mockGroup = {
      id: 1,
      communityId: 1,
      community: { name: 'Test Group', privacy: true, imageURL: 'url' },
      groupSize: 10,
    };

    it('should delete group successfully', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockResolvedValue(true);

      const result = await deleteGroup(1, 1);

      expect(result).toBeNull();
      expect(groupRepository.deleteGroup).toHaveBeenCalledWith(1);
    });

    it('should throw error if no group found', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(null);

      await expect(deleteGroup(999, 1)).rejects.toThrow('Group not found');
    });
  });
});
