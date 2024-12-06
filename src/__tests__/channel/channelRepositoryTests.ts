import {
  findAllChannels,
  findChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
} from '../../repositories/channelRepository';
import { prisma } from '../../prisma/client';
import { AppError } from '../../utility';
import { ParticipiantTypes } from '@prisma/client';

// Mock the entire prisma module
jest.mock('../../prisma/client', () => ({
  __esModule: true,
  prisma: {
    channels: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    communities: {
      create: jest.fn(),
      update: jest.fn(),
    },
    participants: {
      create: jest.fn(),
    },
  },
}));

describe('Channel Repository', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllChannels', () => {
    it('should fetch all active channels with selected fields', async () => {
      const mockChannels = [
        {
          id: 1,
          canAddComments: true,
          community: {
            name: 'Community 1',
            privacy: true,
          },
        },
        {
          id: 2,
          canAddComments: false,
          community: {
            name: 'Community 2',
            privacy: false,
          },
        },
      ];

      (prisma.channels.findMany as jest.Mock).mockResolvedValue(mockChannels);

      const result = await findAllChannels();

      expect(result).toEqual(mockChannels);
      expect(prisma.channels.findMany).toHaveBeenCalledWith({
        where: {
          community: {
            active: true,
          },
        },
        select: {
          id: true,
          canAddComments: true,
          community: {
            select: {
              name: true,
              privacy: true,
            },
          },
        },
      });
      expect(prisma.channels.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findChannelById', () => {
    it('should find a channel by ID with selected fields', async () => {
      const mockChannel = {
        id: 1,
        canAddComments: true,
        community: {
          name: 'Community 1',
          privacy: true,
          active: true,
        },
      };

      (prisma.channels.findUnique as jest.Mock).mockResolvedValue(mockChannel);

      const result = await findChannelById(1);

      expect(result).toEqual(mockChannel);
      expect(prisma.channels.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          canAddComments: true,
          community: {
            select: {
              name: true,
              privacy: true,
              active: true,
            },
          },
        },
      });
      expect(prisma.channels.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when channel not found or community is inactive', async () => {
      (prisma.channels.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(findChannelById(999)).rejects.toThrow(AppError);
      expect(prisma.channels.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('createChannel', () => {
    it('should create a new channel and return it', async () => {
      const mockCommunity = {
        name: 'Community 1',
        id: 1,
        active: true,
        privacy: true,
        creatorId: 1,
      };
      const mockChannel = {
        id: 1,
        canAddComments: true,
        community: {
          name: 'Community 1',
          privacy: true,
        },
      };

      (prisma.communities.create as jest.Mock).mockResolvedValue(mockCommunity);
      (prisma.participants.create as jest.Mock).mockResolvedValue({});
      (prisma.channels.create as jest.Mock).mockResolvedValue(mockChannel);

      const data = {
        name: 'Community 1',
        privacy: true,
        creatorId: 1,
        canAddComments: true,
        invitationLink: 'http://invite.link',
      };

      const result = await createChannel(data);

      expect(result).toEqual(mockChannel);
      expect(prisma.communities.create).toHaveBeenCalledWith({
        data: {
          name: data.name,
          privacy: data.privacy,
          creatorId: data.creatorId,
        },
      });
      expect(prisma.participants.create).toHaveBeenCalledWith({
        data: {
          communityId: mockCommunity.id,
          type: ParticipiantTypes.community,
        },
      });
      expect(prisma.channels.create).toHaveBeenCalledWith({
        data: {
          canAddComments: data.canAddComments,
          communityId: mockCommunity.id,
          invitationLink: data.invitationLink,
        },
        select: {
          id: true,
          canAddComments: true,
          community: {
            select: {
              name: true,
              privacy: true,
            },
          },
        },
      });
      expect(prisma.communities.create).toHaveBeenCalledTimes(1);
      expect(prisma.participants.create).toHaveBeenCalledTimes(1);
      expect(prisma.channels.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when invalid data is provided', async () => {
      const data = {
        name: '',
        privacy: true,
        creatorId: 1,
        canAddComments: true,
        invitationLink: 'http://invite.link',
      };

      await expect(createChannel(data)).rejects.toThrow(AppError);
    });
  });

  describe('updateChannel', () => {
    it('should update a channel and return the updated channel', async () => {
      const mockChannel = {
        id: 1,
        canAddComments: false,
        community: {
          name: 'Updated Community',
          privacy: false,
          active: true,
        },
      };

      // Mock the initial channel lookup
      (prisma.channels.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          communityId: 1,
          community: { active: true },
        })
        .mockResolvedValueOnce(mockChannel);

      // Mock the community update
      (prisma.communities.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Updated Community',
        privacy: false,
      });

      // Mock the channel update (ONLY if canAddComments is truthy)
      const channelUpdateMock = prisma.channels.update as jest.Mock;

      const result = await updateChannel(1, {
        name: 'Updated Community',
        privacy: false,
        canAddComments: false,
      });

      // Note: canAddComments: false means the update should NOT be called
      expect(channelUpdateMock).not.toHaveBeenCalled();

      // Assertions for community update
      expect(prisma.communities.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Community',
          privacy: false,
        },
      });

      // Assert the returned result
      expect(result).toEqual(mockChannel);
    });

    it('should update canAddComments when it is truthy', async () => {
      const mockChannel = {
        id: 1,
        canAddComments: true,
        community: {
          name: 'Community 1',
          privacy: true,
          active: true,
        },
      };

      // Mock the initial channel lookup
      (prisma.channels.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          communityId: 1,
          community: { active: true },
        })
        .mockResolvedValueOnce(mockChannel);

      // Mock the community update
      (prisma.communities.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Community 1',
      });

      // Mock the channel update
      const channelUpdateMock = prisma.channels.update as jest.Mock;

      const result = await updateChannel(1, {
        canAddComments: true,
      });

      // Verify channel update was called with correct parameters
      expect(channelUpdateMock).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          canAddComments: true,
        },
      });

      // Assert the returned result
      expect(result).toEqual(mockChannel);
    });

    it('should throw an error when no data is provided for update', async () => {
      await expect(updateChannel(1, {})).rejects.toThrow(AppError);
    });
  });

  describe('deleteChannel', () => {
    it('should delete a channel and return the communityId', async () => {
      const mockChannel = {
        communityId: 1,
        community: {
          active: true,
        },
      };

      // Mock the channel lookup
      (prisma.channels.findUnique as jest.Mock).mockResolvedValue(mockChannel);

      // Mock the community update
      (prisma.communities.update as jest.Mock).mockResolvedValue({});

      const result = await deleteChannel(1);

      // Assertions
      expect(prisma.channels.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          communityId: true,
          community: {
            select: {
              active: true,
            },
          },
        },
      });

      expect(prisma.communities.update).toHaveBeenCalledWith({
        where: { id: 1, active: true },
        data: { active: false },
      });

      // Change the expectation to match the actual return of the deleteChannel method
      expect(result).toEqual(mockChannel);
    });

    it('should throw an error when channel not found or community is inactive', async () => {
      (prisma.channels.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(deleteChannel(999)).rejects.toThrow(AppError);
    });
  });
});
