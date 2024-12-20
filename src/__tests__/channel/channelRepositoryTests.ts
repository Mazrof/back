import { prisma } from '../../prisma/client';
import { findAllChannels, findChannelById, createChannel, updateChannel } from '../../repositories/channelRepository';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

// Mock the entire prisma client
jest.mock('../../prisma/client', () => ({
  prisma: {
    channels: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Channel Repository', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllChannels', () => {
    const mockChannels = [
      {
        id: 1,
        communityId: 1,
        canAddComments: true,
        invitationLink: 'link1',
        community: {
          name: 'Community 1',
          privacy: true,
          imageURL: 'image1.jpg',
          active: true,
        },
      },
      {
        id: 2,
        communityId: 2,
        canAddComments: false,
        invitationLink: 'link2',
        community: {
          name: 'Community 2',
          privacy: false,
          imageURL: 'image2.jpg',
          active: true,
        },
      },
    ];

    it('should return all active channels', async () => {
      (prisma.channels.findMany as jest.Mock).mockResolvedValue(mockChannels);

      const result = await findAllChannels();

      expect(result).toEqual(mockChannels);
      expect(prisma.channels.findMany).toHaveBeenCalledWith({
        where: {
          community: {
            active: true,
          },
        },
        select: expect.any(Object),
      });
    });

    it('should return empty array when no channels found', async () => {
      (prisma.channels.findMany as jest.Mock).mockResolvedValue([]);

      const result = await findAllChannels();

      expect(result).toEqual([]);
      expect(prisma.channels.findMany).toHaveBeenCalled();
    });
  });

  describe('findChannelById', () => {
    const mockChannel = {
      id: 1,
      communityId: 1,
      canAddComments: true,
      invitationLink: 'link1',
      community: {
        name: 'Test Community',
        privacy: true,
        imageURL: 'test.jpg',
        active: true,
      },
    };

    it('should return channel when found', async () => {
      (prisma.channels.findUnique as jest.Mock).mockResolvedValue(mockChannel);

      const result = await findChannelById(1);

      expect(result).toEqual(mockChannel);
      expect(prisma.channels.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Object),
      });
    });

    it('should return null when channel not found', async () => {
      (prisma.channels.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findChannelById(999);

      expect(result).toBeNull();
      expect(prisma.channels.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: expect.any(Object),
      });
    });
  });

  describe('createChannel', () => {
    const mockChannelData = {
      name: 'New Channel',
      privacy: true,
      creatorId: 1,
      canAddComments: true,
      invitationLink: 'newlink',
      imageURL: 'new.jpg',
    };

    const mockCreatedChannel = {
      id: 1,
      communityId: 1,
      canAddComments: true,
      invitationLink: 'newlink',
      community: {
        name: 'New Channel',
        privacy: true,
        imageURL: 'new.jpg',
      },
    };

    it('should create new channel with all provided data', async () => {
      (prisma.channels.create as jest.Mock).mockResolvedValue(mockCreatedChannel);

      const result = await createChannel(mockChannelData);

      expect(result).toEqual(mockCreatedChannel);
      expect(prisma.channels.create).toHaveBeenCalledWith({
        data: {
          canAddComments: mockChannelData.canAddComments,
          invitationLink: mockChannelData.invitationLink,
          community: {
            create: {
              name: mockChannelData.name,
              privacy: mockChannelData.privacy,
              creatorId: mockChannelData.creatorId,
              imageURL: mockChannelData.imageURL,
            },
          },
        },
        select: expect.any(Object),
      });
    });

    it('should create channel with minimal required data', async () => {
      const minimalData = {
        name: 'Minimal Channel',
        creatorId: 1,
        invitationLink: 'minlink',
      };

      const mockMinimalChannel = {
        ...mockCreatedChannel,
        name: minimalData.name,
        invitationLink: minimalData.invitationLink,
      };

      (prisma.channels.create as jest.Mock).mockResolvedValue(mockMinimalChannel);

      const result = await createChannel(minimalData);

      expect(result).toEqual(mockMinimalChannel);
      expect(prisma.channels.create).toHaveBeenCalledWith({
        data: {
          canAddComments: undefined,
          invitationLink: minimalData.invitationLink,
          community: {
            create: {
              name: minimalData.name,
              privacy: undefined,
              creatorId: minimalData.creatorId,
              imageURL: undefined,
            },
          },
        },
        select: expect.any(Object),
      });
    });
  });

  describe('updateChannel', () => {
    const mockUpdatedChannel = {
      id: 1,
      communityId: 1,
      canAddComments: false,
      invitationLink: 'link1',
      community: {
        name: 'Test Community',
        privacy: true,
        imageURL: 'test.jpg',
      },
    };

    it('should update channel comments setting', async () => {
      (prisma.channels.update as jest.Mock).mockResolvedValue(mockUpdatedChannel);

      const result = await updateChannel(1, false);

      expect(result).toEqual(mockUpdatedChannel);
      expect(prisma.channels.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          canAddComments: false,
        },
        select: expect.any(Object),
      });
    });

    it('should handle undefined canAddComments parameter', async () => {
      (prisma.channels.update as jest.Mock).mockResolvedValue(mockUpdatedChannel);

      const result = await updateChannel(1);

      expect(result).toEqual(mockUpdatedChannel);
      expect(prisma.channels.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          canAddComments: undefined,
        },
        select: expect.any(Object),
      });
    });
  });
});