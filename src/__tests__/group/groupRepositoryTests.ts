// import { prisma } from '../../prisma/client';
// import {
//   findAllGroups,
//   findGroupById,
//   createGroup,
//   updateGroup,
//   deleteGroup,
//   applyGroupFilter,
// } from '../../repositories/groupRepository';
// import { AppError } from '../../utility';
//
// // Mock the entire prisma module
// jest.mock('../../prisma/client', () => ({
//   __esModule: true,
//   prisma: {
//     groups: {
//       findMany: jest.fn(),
//       findUnique: jest.fn(),
//       create: jest.fn(),
//       update: jest.fn(),
//     },
//     communities: {
//       create: jest.fn(),
//       update: jest.fn(),
//     },
//     participants: {
//       create: jest.fn(),
//     },
//     adminGroupFilters: {
//       findMany: jest.fn(),
//       findFirst: jest.fn(),
//       create: jest.fn(),
//       delete: jest.fn(),
//     },
//     groupMemberships: {
//       count: jest.fn(),
//     },
//   },
// }));
//
// describe('Group Repository', () => {
//   // Clear mocks before each test
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//
//   describe('findAllGroups', () => {
//     it('should fetch all groups with filters', async () => {
//       const mockGroups = [
//         { id: 1, groupSize: 10, community: { name: 'Test', privacy: true } },
//       ];
//       const mockFilters = [{ groupId: 1 }];
//
//       (prisma.groups.findMany as jest.Mock).mockResolvedValue(mockGroups);
//       (prisma.adminGroupFilters.findMany as jest.Mock).mockResolvedValue(
//         mockFilters
//       );
//
//       const result = await findAllGroups();
//
//       expect(result).toEqual([
//         {
//           id: 1,
//           groupSize: 10,
//           community: { name: 'Test', privacy: true },
//           hasFilter: true,
//         },
//       ]);
//       expect(prisma.groups.findMany).toHaveBeenCalledTimes(1);
//       expect(prisma.adminGroupFilters.findMany).toHaveBeenCalledTimes(1);
//     });
//   });
//
//   describe('findGroupById', () => {
//     it('should fetch group by ID', async () => {
//       const mockGroup = {
//         id: 1,
//         groupSize: 10,
//         community: { name: 'Test', privacy: true, active: true },
//       };
//
//       (prisma.groups.findUnique as jest.Mock).mockResolvedValue(mockGroup);
//
//       const result = await findGroupById(1);
//
//       expect(result).toEqual(mockGroup);
//       expect(prisma.groups.findUnique).toHaveBeenCalledWith({
//         where: { id: 1 },
//         select: {
//           id: true,
//           groupSize: true,
//           community: {
//             select: { name: true, privacy: true, active: true },
//           },
//         },
//       });
//     });
//
//     it('should throw an error if group is not found', async () => {
//       (prisma.groups.findUnique as jest.Mock).mockResolvedValue(null);
//
//       await expect(findGroupById(1)).rejects.toThrow(AppError);
//       expect(prisma.groups.findUnique).toHaveBeenCalledTimes(1);
//     });
//   });
//
//   describe('createGroup', () => {
//     it('should create a new group', async () => {
//       const mockCommunity = { id: 1, name: 'Community', privacy: true };
//       const mockGroup = {
//         id: 1,
//         groupSize: 10,
//         community: { name: 'Community', privacy: true },
//       };
//
//       (prisma.communities.create as jest.Mock).mockResolvedValue(mockCommunity);
//       (prisma.groups.create as jest.Mock).mockResolvedValue(mockGroup);
//
//       const data = {
//         name: 'Community',
//         privacy: true,
//         creatorId: 1,
//         groupSize: 10,
//         invitationLink: 'test-link',
//       };
//
//       const result = await createGroup(data);
//
//       expect(result).toEqual(mockGroup);
//       expect(prisma.communities.create).toHaveBeenCalledWith({
//         data: { name: 'Community', privacy: true, creatorId: 1 },
//       });
//       expect(prisma.groups.create).toHaveBeenCalledWith({
//         data: {
//           groupSize: 10,
//           communityId: mockCommunity.id,
//           invitationLink: 'test-link',
//         },
//         select: {
//           id: true,
//           groupSize: true,
//           community: {
//             select: { name: true, privacy: true },
//           },
//         },
//       });
//     });
//   });
//
//   describe('updateGroup', () => {
//     it('should update group information', async () => {
//       const mockGroup = {
//         id: 1,
//         groupSize: 10,
//         community: { active: true },
//         communityId: 1,
//       };
//
//       (prisma.groups.findUnique as jest.Mock).mockResolvedValue(mockGroup);
//       (prisma.communities.update as jest.Mock).mockResolvedValue({});
//       (prisma.groups.update as jest.Mock).mockResolvedValue(mockGroup);
//
//       const result = await updateGroup(1, {
//         name: 'Updated Name',
//         privacy: false,
//       });
//
//       expect(result).toEqual(mockGroup);
//       expect(prisma.communities.update).toHaveBeenCalledWith({
//         where: { id: 1 },
//         data: { name: 'Updated Name', privacy: false },
//       });
//     });
//   });
//
//   describe('deleteGroup', () => {
//     it('should delete a group and deactivate its community', async () => {
//       const mockGroup = { communityId: 1, community: { active: true } };
//
//       (prisma.groups.findUnique as jest.Mock).mockResolvedValue(mockGroup);
//       (prisma.communities.update as jest.Mock).mockResolvedValue({});
//
//       const result = await deleteGroup(1);
//
//       expect(result).toEqual(mockGroup);
//       expect(prisma.groups.findUnique).toHaveBeenCalledWith({
//         where: { id: 1 },
//         select: {
//           communityId: true,
//           community: { select: { active: true } },
//         },
//       });
//       expect(prisma.communities.update).toHaveBeenCalledWith({
//         where: { id: 1 },
//         data: { active: false },
//       });
//     });
//   });
//
//   describe('applyGroupFilter', () => {
//     it('should apply a filter to a group', async () => {
//       const mockGroupFilter = { groupId: 1, adminId: 1 };
//
//       (prisma.adminGroupFilters.findFirst as jest.Mock).mockResolvedValue(null);
//       (prisma.adminGroupFilters.create as jest.Mock).mockResolvedValue(
//         mockGroupFilter
//       );
//
//       const result = await applyGroupFilter(1, 1);
//
//       expect(result).toEqual(mockGroupFilter);
//       expect(prisma.adminGroupFilters.create).toHaveBeenCalledWith({
//         data: { groupId: 1, adminId: 1 },
//         select: { groupId: true, adminId: true },
//       });
//     });
//   });
// });
