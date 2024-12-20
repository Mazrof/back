import { prisma } from '../../prisma/client';
import { ParticipiantTypes } from '@prisma/client';
import {
  findAllGroups,
  findGroupById,
  createGroup,
  updateGroup,
  getGroupSize,
  deleteGroup,
  findGroupFilter,
  deleteGroupFilter,
  createGroupFilter,
} from '../../repositories/groupRepository';

// Mock the prisma client
jest.mock('../../prisma/client', () => ({
  prisma: {
    groups: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    groupMemberships: {
      count: jest.fn(),
    },
    communities: {
      update: jest.fn(),
    },
    adminGroupFilters: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Group Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllGroups', () => {
    const mockGroups = [
      {
        id: 1,
        groupSize: 10,
        community: {
          name: 'Community 1',
          privacy: true,
          imageURL: 'image1.jpg',
        },
        adminGroupFilters: [{ groupId: 1 }],
      },
      {
        id: 2,
        groupSize: 5,
        community: {
          name: 'Community 2',
          privacy: false,
          imageURL: 'image2.jpg',
        },
        adminGroupFilters: [],
      },
    ];

    it('should return all active groups', async () => {
      (prisma.groups.findMany as jest.Mock).mockResolvedValue(mockGroups);

      const result = await findAllGroups();

      expect(result).toEqual(mockGroups);
      expect(prisma.groups.findMany).toHaveBeenCalledWith({
        where: {
          community: {
            active: true,
          },
        },
        select: expect.any(Object),
      });
    });

    it('should return empty array when no groups found', async () => {
      (prisma.groups.findMany as jest.Mock).mockResolvedValue([]);

      const result = await findAllGroups();

      expect(result).toEqual([]);
      expect(prisma.groups.findMany).toHaveBeenCalled();
    });
  });

  describe('findGroupById', () => {
    const mockGroup = {
      id: 1,
      groupSize: 10,
      communityId: 1,
      community: {
        name: 'Test Community',
        privacy: true,
        active: true,
        imageURL: 'test.jpg',
      },
      adminGroupFilters: [{ groupId: 1 }],
    };

    it('should return group when found', async () => {
      (prisma.groups.findUnique as jest.Mock).mockResolvedValue(mockGroup);

      const result = await findGroupById(1);

      expect(result).toEqual(mockGroup);
      expect(prisma.groups.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Object),
      });
    });

    it('should return null when group not found', async () => {
      (prisma.groups.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findGroupById(999);

      expect(result).toBeNull();
      expect(prisma.groups.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: expect.any(Object),
      });
    });
  });

  describe('createGroup', () => {
    const mockGroupData = {
      name: 'New Group',
      privacy: true,
      creatorId: 1,
      groupSize: 5,
      invitationLink: 'newlink',
      imageURL: 'new.jpg',
    };

    const mockCreatedGroup = {
      id: 1,
      groupSize: 5,
      community: {
        name: 'New Group',
        privacy: true,
        imageURL: 'new.jpg',
      },
    };

    it('should create new group with all provided data', async () => {
      (prisma.groups.create as jest.Mock).mockResolvedValue(mockCreatedGroup);

      const result = await createGroup(mockGroupData);

      expect(result).toEqual(mockCreatedGroup);
      expect(prisma.groups.create).toHaveBeenCalledWith({
        data: {
          groupSize: mockGroupData.groupSize,
          invitationLink: mockGroupData.invitationLink,
          community: {
            create: {
              name: mockGroupData.name,
              privacy: mockGroupData.privacy,
              creatorId: mockGroupData.creatorId,
              imageURL: mockGroupData.imageURL,
              participants: {
                create: {
                  type: ParticipiantTypes.community,
                },
              },
            },
          },
        },
        select: expect.any(Object),
      });
    });

    it('should create group without optional imageURL', async () => {
      const dataWithoutImage = {
        name: 'New Group',
        privacy: true,
        creatorId: 1,
        groupSize: 5,
        invitationLink: 'newlink',
      };

      const mockCreatedGroupNoImage = {
        ...mockCreatedGroup,
        community: {
          ...mockCreatedGroup.community,
          imageURL: undefined,
        },
      };

      (prisma.groups.create as jest.Mock).mockResolvedValue(mockCreatedGroupNoImage);

      const result = await createGroup(dataWithoutImage);

      expect(result).toEqual(mockCreatedGroupNoImage);
      expect(prisma.groups.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          community: {
            create: expect.not.objectContaining({
              imageURL: expect.any(String),
            }),
          },
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('updateGroup', () => {
    const mockUpdatedGroup = {
      id: 1,
      groupSize: 15,
      community: {
        name: 'Test Community',
        privacy: true,
        imageURL: 'test.jpg',
      },
    };

    it('should update group size', async () => {
      (prisma.groups.update as jest.Mock).mockResolvedValue(mockUpdatedGroup);

      const result = await updateGroup(1, 15);

      expect(result).toEqual(mockUpdatedGroup);
      expect(prisma.groups.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { groupSize: 15 },
        select: expect.any(Object),
      });
    });

    it('should handle undefined groupSize parameter', async () => {
      (prisma.groups.update as jest.Mock).mockResolvedValue(mockUpdatedGroup);

      const result = await updateGroup(1);

      expect(result).toEqual(mockUpdatedGroup);
      expect(prisma.groups.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { groupSize: undefined },
        select: expect.any(Object),
      });
    });
  });

  describe('getGroupSize', () => {
    it('should return active members count', async () => {
      (prisma.groupMemberships.count as jest.Mock).mockResolvedValue(5);

      const result = await getGroupSize(1);

      expect(result).toBe(5);
      expect(prisma.groupMemberships.count).toHaveBeenCalledWith({
        where: {
          AND: {
            groupId: 1,
            active: true,
          },
        },
      });
    });
  });

  describe('deleteGroup', () => {
    it('should deactivate group by updating community', async () => {
      await deleteGroup(1);

      expect(prisma.communities.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
    });
  });

  describe('Group Filter Operations', () => {
    const mockFilter = {
      adminId: 1,
      groupId: 1,
    };

    describe('findGroupFilter', () => {
      it('should find existing filter', async () => {
        (prisma.adminGroupFilters.findUnique as jest.Mock).mockResolvedValue(mockFilter);

        const result = await findGroupFilter(1, 1);

        expect(result).toEqual(mockFilter);
        expect(prisma.adminGroupFilters.findUnique).toHaveBeenCalledWith({
          where: {
            adminId_groupId: {
              adminId: 1,
              groupId: 1,
            },
          },
          select: expect.any(Object),
        });
      });

      it('should return null when filter not found', async () => {
        (prisma.adminGroupFilters.findUnique as jest.Mock).mockResolvedValue(null);

        const result = await findGroupFilter(999, 999);

        expect(result).toBeNull();
      });
    });

    describe('deleteGroupFilter', () => {
      it('should delete existing filter', async () => {
        (prisma.adminGroupFilters.delete as jest.Mock).mockResolvedValue(mockFilter);

        const result = await deleteGroupFilter(1, 1);

        expect(result).toEqual(mockFilter);
        expect(prisma.adminGroupFilters.delete).toHaveBeenCalledWith({
          where: {
            adminId_groupId: {
              adminId: 1,
              groupId: 1,
            },
          },
          select: expect.any(Object),
        });
      });
    });

    describe('createGroupFilter', () => {
      it('should create new filter', async () => {
        (prisma.adminGroupFilters.create as jest.Mock).mockResolvedValue(mockFilter);

        const result = await createGroupFilter(1, 1);

        expect(result).toEqual(mockFilter);
        expect(prisma.adminGroupFilters.create).toHaveBeenCalledWith({
          data: {
            groupId: 1,
            adminId: 1,
          },
          select: expect.any(Object),
        });
      });
    });
  });
});