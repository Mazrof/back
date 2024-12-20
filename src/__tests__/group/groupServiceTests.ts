jest.mock('../../server', () => ({
  io: jest.fn(),
}));

jest.mock('../../repositories');
jest.mock('../../services/groupMemberService');
jest.mock('../../utility/invitationLink');
jest.mock('../../middlewares/imageHandlers');
jest.mock('../../services/adminService');

import * as groupRepository from '../../repositories';
import * as groupMemberService from '../../services/groupMemberService';
import * as adminService from '../../services/adminService';
import { CommunityRole } from '@prisma/client';
import { AppError } from '../../utility';
import generateInvitationLink from '../../utility/invitationLink';
import {
  convertBase64ToImage,
  convertImageToBase64,
  saveImage,
} from '../../middlewares/imageHandlers';
import {
  findAllGroups,
  findGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  applyGroupFilter,
} from '../../services/groupService';

describe('Group Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllGroups', () => {
    const mockGroups = [
      {
        id: 1,
        groupSize: 10,
        community: {
          name: 'Test Group 1',
          privacy: true,
          imageURL: 'image1.jpg',
        },
        adminGroupFilters: { groupId: 1 },
      },
      {
        id: 2,
        groupSize: 5,
        community: {
          name: 'Test Group 2',
          privacy: false,
          imageURL: 'image2.jpg',
        },
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
          community: {
            name: 'Test Group 1',
            privacy: true,
            imageURL: 'image1.jpg',
          },
          hasFilter: true,
        },
        {
          id: 2,
          groupSize: 5,
          community: {
            name: 'Test Group 2',
            privacy: false,
            imageURL: 'image2.jpg',
          },
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
      groupSize: 10,
      community: {
        name: 'Test Group',
        privacy: true,
        imageURL: 'image.jpg',
        active: true,
      },
      adminGroupFilters: null,
    };

    it('should return group by id when found', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);

      const result = await findGroupById(1);

      expect(result).toEqual({
        id: 1,
        communityId: 1,
        groupSize: 10,
        community: {
          name: 'Test Group',
          privacy: true,
          imageURL: 'image.jpg',
        },
        hasFilter: false,
      });
      expect(groupRepository.findGroupById).toHaveBeenCalledWith(1);
    });

    it('should throw error when group not found', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(null);

      await expect(findGroupById(999)).rejects.toThrow(
        new AppError('No Group found with that ID', 404)
      );
    });

    it('should throw error when community is inactive', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue({
        ...mockGroup,
        community: { ...mockGroup.community, active: false },
      });

      await expect(findGroupById(1)).rejects.toThrow(
        new AppError('No Group found with that ID', 404)
      );
    });
  });

  describe('createGroup', () => {
    const mockGroupData = {
      name: 'New Group',
      privacy: true,
      creatorId: 1,
      groupSize: 10,
      imageURL: 'base64image',
    };

    const mockCreatedGroup = {
      id: 1,
      community: {
        name: 'New Group',
        privacy: true,
        imageURL: 'saved-image.jpg',
      },
      groupSize: 10,
    };

    it('should create group with valid data', async () => {
      (convertBase64ToImage as jest.Mock).mockReturnValue('decoded-image');
      (saveImage as jest.Mock).mockReturnValue('saved-image.jpg');
      (generateInvitationLink as jest.Mock).mockReturnValue('invite-link');
      (groupRepository.createGroup as jest.Mock).mockResolvedValue(
        mockCreatedGroup
      );
      (convertImageToBase64 as jest.Mock).mockReturnValue('base64-converted');

      const result = await createGroup(mockGroupData);

      expect(result).toEqual({
        ...mockCreatedGroup,
        community: {
          ...mockCreatedGroup.community,
          imageURL: 'base64-converted',
        },
      });
      expect(groupMemberService.addGroupCreator).toHaveBeenCalledWith(
        1,
        1,
        CommunityRole.admin
      );
    });

    it('should throw error with invalid data', async () => {
      const invalidData = {
        ...mockGroupData,
        name: '',
        groupSize: 0,
      };

      await expect(createGroup(invalidData)).rejects.toThrow(
        new AppError('Invalid Group name, Invalid Group size', 400)
      );
    });
  });

  describe('updateGroup', () => {
    const mockGroup = {
      id: 1,
      communityId: 1,
      community: {
        name: 'Old Name',
        privacy: true,
        imageURL: 'old-image.jpg',
        active: true,
      },
      groupSize: 10,
    };

    beforeEach(() => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockResolvedValue(true);
    });

    it('should update group with valid data', async () => {
      const mockUpdateData = {
        name: 'Updated Group',
        privacy: false,
        groupSize: 15,
        imageURL: 'new-base64-image',
      };

      (groupRepository.getGroupSize as jest.Mock).mockResolvedValue(5);
      (convertBase64ToImage as jest.Mock).mockReturnValue('decoded-image');
      (saveImage as jest.Mock).mockReturnValue('new-saved-image.jpg');
      (groupRepository.updateGroup as jest.Mock).mockResolvedValue({
        ...mockGroup,
        groupSize: mockUpdateData.groupSize,
        community: {
          ...mockGroup.community,
          imageURL: 'new-saved-image.jpg',
        },
      });
      (convertImageToBase64 as jest.Mock).mockReturnValue(
        'new-base64-converted'
      );

      const result = await updateGroup(1, 1, mockUpdateData);

      // Ensure the group size is handled correctly in the updateCommunity call
      expect(groupRepository.updateCommunity).toHaveBeenCalledWith(1, {
        name: 'Updated Group',
        privacy: false,
        imageURL: 'new-saved-image.jpg',
        groupSize: 15, // Include groupSize here if it's part of the updateCommunity method
      });

      expect(groupRepository.updateGroup).toHaveBeenCalledWith(1, 15);
      expect(result.community.imageURL).toBe('new-base64-converted');
    });

    it('should throw error when group size is less than current member count', async () => {
      const mockGroup = {
        id: 1,
        community: { active: true },
        members: [], // Add members as needed
      };

      // Mock the response for fetching the group
      (groupRepository.getGroupSize as jest.Mock).mockResolvedValue(20);
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup); // Make sure the group is fetched correctly

      await expect(updateGroup(1, 1, { groupSize: 15 })).rejects.toThrowError(
        new AppError('Invalid Group Size Limit', 400)
      );
    });

    it('should throw error when no data to update', async () => {
      const mockGroup = {
        id: 1,
        community: { active: true },
      };

      // Mock the response for fetching the group
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);

      // Test with no data to update
      await expect(
        updateGroup(1, 1, {}) // Empty data
      ).rejects.toThrow(new AppError('No data to update', 400));
    });
  });

  describe('deleteGroup', () => {
    const mockGroup = {
      id: 1,
      communityId: 1,
      community: {
        name: 'Test Group',
        privacy: true,
        imageURL: 'image.jpg',
        active: true,
      },
    };

    it('should delete group successfully', async () => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (
        groupMemberService.checkGroupMemberPermission as jest.Mock
      ).mockResolvedValue(true);

      const result = await deleteGroup(1, 1);

      expect(result).toBeNull();
      expect(groupRepository.updateCommunity).toHaveBeenCalledWith(1, {
        active: false,
      });
    });
  });

  describe('applyGroupFilter', () => {
    const mockGroup = {
      id: 1,
      communityId: 1,
      community: {
        name: 'Test Group',
        privacy: true,
        imageURL: 'image.jpg',
        active: true,
      },
    };

    beforeEach(() => {
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (adminService.checkAdmin as jest.Mock).mockResolvedValue(true);
    });

    it('should apply filter when not exists', async () => {
      const mockFilter = { adminId: 1, groupId: 1 };
      (groupRepository.findGroupFilter as jest.Mock).mockResolvedValue(null);
      (groupRepository.createGroupFilter as jest.Mock).mockResolvedValue(
        mockFilter
      );

      const result = await applyGroupFilter(1, 1);

      expect(result).toEqual(mockFilter);
      expect(groupRepository.createGroupFilter).toHaveBeenCalledWith(1, 1);
    });

    it('should remove filter when exists', async () => {
      const mockGroup = {
        id: 1,
        community: { active: true },
      };

      const mockFilter = { adminId: 1, groupId: 1 };

      // Mocking the repository methods
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup); // Mock group retrieval
      (groupRepository.findGroupFilter as jest.Mock).mockResolvedValue(
        mockFilter
      ); // Mock filter retrieval
      (groupRepository.deleteGroupFilter as jest.Mock).mockResolvedValue(null); // Mock filter deletion

      // Apply group filter
      const result = await applyGroupFilter(1, 1);

      // Assertions
      expect(result).toBeNull();
      expect(groupRepository.deleteGroupFilter).toHaveBeenCalledWith(1, 1);
    });
  });
});
