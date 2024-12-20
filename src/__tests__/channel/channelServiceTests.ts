jest.mock('../../repositories/channelRepository');
jest.mock('../../repositories/communityRepository');
jest.mock('../../services/channelMemberService');
jest.mock('../../middlewares/imageHandlers');
jest.mock('../../utility/invitationLink');

import * as channelRepository from '../../repositories/channelRepository';
import * as communityRepository from '../../repositories/communityRepository';
import * as channelMemberService from '../../services/channelMemberService';
import {
  convertBase64ToImage,
  convertImageToBase64,
  saveImage,
} from '../../middlewares/imageHandlers';
import generateInvitationLink from '../../utility/invitationLink';
import { AppError } from '../../utility';
import { CommunityRole } from '@prisma/client';
import {
  findAllChannels,
  findChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
} from '../../services/channelService';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

describe('Channel Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockChannel = {
    id: 1,
    name: 'Test Channel',
    canAddComments: true,
    communityId: 1,
    community: {
      name: 'Test Community',
      privacy: false,
      active: true,
      imageURL: 'test-image.jpg',
    },
  };

  describe('findAllChannels', () => {
    it('should return all channels', async () => {
      const mockChannels = [mockChannel];
      (channelRepository.findAllChannels as jest.Mock).mockResolvedValue(
        mockChannels
      );

      const result = await findAllChannels();

      expect(result).toEqual(mockChannels);
      expect(channelRepository.findAllChannels).toHaveBeenCalled();
    });
  });

  describe('findChannelById', () => {
    it('should return channel when found and active', async () => {
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(
        mockChannel
      );

      const result = await findChannelById(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockChannel.id,
          canAddComments: mockChannel.canAddComments,
        })
      );
    });

    it('should throw AppError when channel not found', async () => {
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(null);

      await expect(findChannelById(999)).rejects.toThrow(
        new AppError('No channel found with that ID', 404)
      );
    });

    it('should throw AppError when community is not active', async () => {
      const inactiveChannel = {
        ...mockChannel,
        community: { ...mockChannel.community, active: false },
      };
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(
        inactiveChannel
      );

      await expect(findChannelById(1)).rejects.toThrow(
        new AppError('No channel found with that ID', 404)
      );
    });
  });

  describe('createChannel', () => {
    const mockCreateData = {
      name: 'New Channel',
      creatorId: 1,
      privacy: false,
      canAddComments: true,
      imageURL: 'base64-image-data',
    };

    beforeEach(() => {
      (generateInvitationLink as jest.Mock).mockReturnValue(
        'mock-invitation-link'
      );
      (convertBase64ToImage as jest.Mock).mockReturnValue('decoded-image');
      (saveImage as jest.Mock).mockReturnValue('saved-image-path');
      (convertImageToBase64 as jest.Mock).mockReturnValue('converted-base64');
    });

    it('should create channel successfully', async () => {
      const mockCreatedChannel = {
        id: 1,
        canAddComments: true,
        community: {
          name: 'New Channel',
          privacy: false,
          imageURL: 'saved-image-path',
        },
      };

      (channelRepository.createChannel as jest.Mock).mockResolvedValue(
        mockCreatedChannel
      );
      (channelMemberService.addChannelMember as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await createChannel(mockCreateData);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockCreatedChannel.id,
          canAddComments: mockCreatedChannel.canAddComments,
        })
      );
      expect(channelMemberService.addChannelMember).toHaveBeenCalledWith(
        mockCreateData.creatorId,
        mockCreatedChannel.id,
        null,
        CommunityRole.admin,
        true
      );
    });

    // it('should throw AppError when required data is missing', async () => {
    //   const invalidData = {
    //     creatorId: 1
    //   };
    //
    //   await expect(createChannel(invalidData as any)).rejects.toThrow(
    //     new AppError('Invalid Group name', 400)
    //   );
    // });
  });

  describe('updateChannel', () => {
    const mockUpdateData = {
      name: 'Updated Channel',
      privacy: true,
      canAddComments: false,
      imageURL: 'new-base64-image',
    };

    beforeEach(() => {
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(
        mockChannel
      );
      (
        channelMemberService.checkChannelMemberPermission as jest.Mock
      ).mockResolvedValue(true);
      (convertBase64ToImage as jest.Mock).mockReturnValue('decoded-image');
      (saveImage as jest.Mock).mockReturnValue('saved-image-path');
    });

    it('should update channel successfully', async () => {
      const mockUpdatedChannel = {
        ...mockChannel,
        canAddComments: false,
        community: {
          ...mockChannel.community,
          name: 'Updated Channel',
          privacy: true,
        },
      };

      // Mocking findChannel to return a valid channel before update
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(
        mockChannel
      );

      // Mock the update methods to return updated data
      (channelRepository.updateChannel as jest.Mock).mockResolvedValue(
        mockUpdatedChannel
      );
      (communityRepository.updateCommunity as jest.Mock).mockResolvedValue(
        undefined
      );

      // Assuming updateChannel is the function under test
      const result = await updateChannel(1, 1, mockUpdateData);

      // Assertions
      expect(result).toEqual(mockUpdatedChannel); // Check if the updated channel is returned
      expect(communityRepository.updateCommunity).toHaveBeenCalled(); // Check if updateCommunity was called
      expect(channelRepository.updateChannel).toHaveBeenCalled(); // Check if updateChannel was called
    });

    it('should throw AppError when no update data provided', async () => {
      // Mock findChannel to return a valid channel
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(
        mockChannel
      );

      // Mock the update functions
      (channelRepository.updateChannel as jest.Mock).mockResolvedValue(
        undefined
      );
      (communityRepository.updateCommunity as jest.Mock).mockResolvedValue(
        undefined
      );

      // Call the function with no update data
      await expect(updateChannel(1, 1, {})).rejects.toThrowError(
        new AppError('No data to update', 400)
      );
    });

    it('should throw AppError when user lacks permission', async () => {
      (
        channelMemberService.checkChannelMemberPermission as jest.Mock
      ).mockRejectedValue(new AppError('Not authorized', 403));

      await expect(updateChannel(1, 1, mockUpdateData)).rejects.toThrow(
        new AppError('Not authorized', 403)
      );
    });
  });

  describe('deleteChannel', () => {
    beforeEach(() => {
      (channelRepository.findChannelById as jest.Mock).mockResolvedValue(
        mockChannel
      );
      (
        channelMemberService.checkChannelMemberPermission as jest.Mock
      ).mockResolvedValue(true);
    });

    it('should delete channel successfully', async () => {
      (communityRepository.updateCommunity as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await deleteChannel(1, 1);

      expect(result).toBeNull();
      expect(communityRepository.updateCommunity).toHaveBeenCalledWith(
        mockChannel.communityId,
        { active: false }
      );
    });

    it('should throw AppError when user lacks permission', async () => {
      (
        channelMemberService.checkChannelMemberPermission as jest.Mock
      ).mockRejectedValue(new AppError('Not authorized', 403));

      await expect(deleteChannel(1, 1)).rejects.toThrow(
        new AppError('Not authorized', 403)
      );
    });
  });
});
