// import prisma from '../../prisma/client';
// import {
//   findChannelMember,
//   findChannelMembers,
//   findExistingMember,
//   addChannelMember,
//   updateChannelMemberStatus,
//   updateChannelMemberData,
//   findChannelByInvitationLinkHash,
// } from '../../repositories/channelMemberRepository';
// import { CommunityRole } from '@prisma/client';
//
// jest.mock('../../prisma/client', () => ({
//   channelSubscriptions: {
//     findUnique: jest.fn(),
//     findMany: jest.fn(),
//     create: jest.fn(),
//     update: jest.fn(),
//   },
//   channels: {
//     findUnique: jest.fn(),
//   },
// }));
//
// describe('Channel Service', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//
//   describe('findChannelMember', () => {
//     it('should find a specific channel member', async () => {
//       const mockMember = { role: CommunityRole.admin, active: true };
//       (prisma.channelSubscriptions.findUnique as jest.Mock).mockResolvedValue(
//         mockMember
//       );
//
//       const result = await findChannelMember(1, 2);
//       expect(result).toEqual(mockMember);
//       expect(prisma.channelSubscriptions.findUnique).toHaveBeenCalledWith({
//         where: { userId_channelId: { userId: 1, channelId: 2 } },
//         select: { role: true, active: true },
//       });
//     });
//   });
//
//   describe('findChannelMembers', () => {
//     it('should return all active channel members', async () => {
//       const mockMembers = [
//         {
//           channelId: 1,
//           userId: 2,
//           role: CommunityRole.member,
//           active: true,
//           hasDownloadPermissions: true,
//           users: { username: 'test_user' },
//         },
//       ];
//       (prisma.channelSubscriptions.findMany as jest.Mock).mockResolvedValue(
//         mockMembers
//       );
//
//       const result = await findChannelMembers(1);
//       expect(result).toEqual(mockMembers);
//       expect(prisma.channelSubscriptions.findMany).toHaveBeenCalledWith({
//         where: { channelId: 1, active: true },
//         select: {
//           channelId: true,
//           userId: true,
//           role: true,
//           active: true,
//           hasDownloadPermissions: true,
//           users: { select: { username: true } },
//         },
//       });
//     });
//   });
//
//   describe('findExistingMember', () => {
//     it('should return existing channel member data', async () => {
//       const mockMember = {
//         role: CommunityRole.member,
//         hasDownloadPermissions: true,
//         active: true,
//       };
//       (prisma.channelSubscriptions.findUnique as jest.Mock).mockResolvedValue(
//         mockMember
//       );
//
//       const result = await findExistingMember(1, 2);
//       expect(result).toEqual(mockMember);
//     });
//   });
//
//   describe('addChannelMember', () => {
//     it('should add a new channel member', async () => {
//       const mockData = {
//         channelId: 1,
//         userId: 2,
//         role: CommunityRole.member,
//         hasDownloadPermissions: true,
//       };
//       (prisma.channelSubscriptions.create as jest.Mock).mockResolvedValue(
//         mockData
//       );
//
//       const result = await addChannelMember(mockData);
//       expect(result).toEqual(mockData);
//       expect(prisma.channelSubscriptions.create).toHaveBeenCalledWith({
//         data: mockData,
//         select: { channelId: true, userId: true, role: true },
//       });
//     });
//   });
//
//   describe('updateChannelMemberStatus', () => {
//     it('should update a channel member status', async () => {
//       const mockData = { userId: 2, channelId: 1, active: false };
//       (prisma.channelSubscriptions.update as jest.Mock).mockResolvedValue(
//         mockData
//       );
//
//       const result = await updateChannelMemberStatus(2, 1, false);
//       expect(result).toEqual(mockData);
//       expect(prisma.channelSubscriptions.update).toHaveBeenCalledWith({
//         where: { userId_channelId: { userId: 2, channelId: 1 } },
//         data: { active: false },
//       });
//     });
//   });
//
//   describe('updateChannelMemberData', () => {
//     it('should update channel member data', async () => {
//       const mockData = { role: CommunityRole.admin };
//       (prisma.channelSubscriptions.update as jest.Mock).mockResolvedValue(
//         mockData
//       );
//
//       const result = await updateChannelMemberData(2, 1, mockData);
//       expect(result).toEqual(mockData);
//       expect(prisma.channelSubscriptions.update).toHaveBeenCalledWith({
//         where: { userId_channelId: { userId: 2, channelId: 1 } },
//         data: mockData,
//       });
//     });
//   });
//
//   describe('findChannelByInvitationLinkHash', () => {
//     it('should find a channel by invitation link hash', async () => {
//       const mockChannel = { id: 1 };
//       (prisma.channels.findUnique as jest.Mock).mockResolvedValue(mockChannel);
//
//       const result = await findChannelByInvitationLinkHash('invitation_hash');
//       expect(result).toEqual(mockChannel);
//       expect(prisma.channels.findUnique).toHaveBeenCalledWith({
//         where: { invitationLink: 'invitation_hash' },
//         select: { id: true },
//       });
//     });
//   });
// });
