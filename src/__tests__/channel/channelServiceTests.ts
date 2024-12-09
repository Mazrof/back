// import * as channelRepository from '../../repositories/channelRepository';
// import * as channelMemberService from '../../services/channelMemberService';
// import { CommunityRole } from '@prisma/client';
// import {
//   generateInviteToken,
//   checkPermission,
//   createChannel,
//   updateChannel,
//   deleteChannel,
// } from '../../services/channelService';
//
// jest.mock('../../server', () => ({
//   io: jest.fn(),
// }));
//
// // Mock dependencies
// jest.mock('../../repositories/channelRepository', () => ({
//   findAllChannels: jest.fn(),
//   findChannelById: jest.fn(),
//   createChannel: jest.fn(),
//   updateChannel: jest.fn(),
//   deleteChannel: jest.fn(),
// }));
//
// jest.mock('../../services/channelMemberService', () => ({
//   checkChannelMemberPermission: jest.fn(),
//   addChannelMember: jest.fn(),
// }));
//
// describe('Channel Service', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//
//   describe('createChannel', () => {
//     it('should create a channel and add members', async () => {
//       const mockData = {
//         name: 'Test Channel',
//         privacy: true,
//         creatorId: 1,
//         canAddComments: true,
//         imageURL: 'image',
//       };
//
//       const mockChannel = {
//         id: 1,
//         canAddComments: true,
//         community: { name: 'Test Channel', privacy: true },
//       };
//
//       (channelRepository.createChannel as jest.Mock).mockResolvedValue(
//         mockChannel
//       );
//       (channelMemberService.addChannelMember as jest.Mock).mockResolvedValue(
//         undefined
//       );
//
//       const result = await createChannel(mockData);
//
//       expect(result).toEqual(mockChannel);
//       expect(channelRepository.createChannel).toHaveBeenCalledWith({
//         ...mockData,
//         invitationLink: expect.any(String), // This will be a hashed invite token
//       });
//       expect(channelMemberService.addChannelMember).toHaveBeenCalledTimes(
//         mockData.admins.length + 1
//       ); // Creator + Admins
//       expect(channelMemberService.addChannelMember).toHaveBeenCalledWith(
//         mockData.creatorId,
//         mockChannel.id,
//         CommunityRole.admin
//       );
//       mockData.admins.forEach((admin) => {
//         expect(channelMemberService.addChannelMember).toHaveBeenCalledWith(
//           admin,
//           mockChannel.id,
//           CommunityRole.admin
//         );
//       });
//     });
//   });
//
//   describe('updateChannel', () => {
//     it('should update channel if the admin has permission', async () => {
//       const mockData = { name: 'Updated Channel', privacy: false };
//       const mockChannel = {
//         id: 1,
//         canAddComments: true,
//         community: { name: 'Updated Channel', privacy: false },
//       };
//       const adminId = 1;
//       const channelId = 1;
//
//       (
//         channelMemberService.checkChannelMemberPermission as jest.Mock
//       ).mockResolvedValue(undefined);
//       (channelRepository.updateChannel as jest.Mock).mockResolvedValue(
//         mockChannel
//       );
//
//       const result = await updateChannel(channelId, adminId, mockData);
//
//       expect(result).toEqual(mockChannel);
//       expect(
//         channelMemberService.checkChannelMemberPermission
//       ).toHaveBeenCalledWith(adminId, channelId);
//       expect(channelRepository.updateChannel).toHaveBeenCalledWith(
//         channelId,
//         mockData
//       );
//     });
//
//     it('should throw error if the admin does not have permission', async () => {
//       const mockData = { name: 'Updated Channel', privacy: false };
//       const adminId = 1;
//       const channelId = 1;
//
//       (
//         channelMemberService.checkChannelMemberPermission as jest.Mock
//       ).mockRejectedValue(new Error('Permission denied'));
//
//       await expect(updateChannel(channelId, adminId, mockData)).rejects.toThrow(
//         'Permission denied'
//       );
//       expect(
//         channelMemberService.checkChannelMemberPermission
//       ).toHaveBeenCalledWith(adminId, channelId);
//       expect(channelRepository.updateChannel).not.toHaveBeenCalled();
//     });
//   });
//
//   describe('deleteChannel', () => {
//     it('should delete channel if admin has permission', async () => {
//       const channelId = 1;
//       const adminId = 1;
//
//       (
//         channelMemberService.checkChannelMemberPermission as jest.Mock
//       ).mockResolvedValue(undefined);
//       (channelRepository.deleteChannel as jest.Mock).mockResolvedValue({
//         communityId: 1,
//       });
//
//       const result = await deleteChannel(channelId, adminId);
//
//       expect(result).toEqual({ communityId: 1 });
//       expect(
//         channelMemberService.checkChannelMemberPermission
//       ).toHaveBeenCalledWith(adminId, channelId);
//       expect(channelRepository.deleteChannel).toHaveBeenCalledWith(channelId);
//     });
//
//     it('should throw error if admin does not have permission', async () => {
//       const channelId = 1;
//       const adminId = 1;
//
//       (
//         channelMemberService.checkChannelMemberPermission as jest.Mock
//       ).mockRejectedValue(new Error('Permission denied'));
//
//       await expect(deleteChannel(channelId, adminId)).rejects.toThrow(
//         'Permission denied'
//       );
//       expect(
//         channelMemberService.checkChannelMemberPermission
//       ).toHaveBeenCalledWith(adminId, channelId);
//       expect(channelRepository.deleteChannel).not.toHaveBeenCalled();
//     });
//   });
//
//   describe('generateInviteToken', () => {
//     it('should generate a valid token', () => {
//       const token = generateInviteToken();
//       expect(token).toHaveLength(64); // 32 bytes * 2 for hex
//     });
//   });
//
//   describe('checkPermission', () => {
//     it('should call checkChannelMemberPermission with correct params', async () => {
//       const adminId = 1;
//       const channelId = 1;
//
//       // Mock the implementation of the checkChannelMemberPermission method
//       (
//         channelMemberService.checkChannelMemberPermission as jest.Mock
//       ).mockResolvedValue(undefined);
//
//       await checkPermission(adminId, channelId);
//
//       // Verify that the method was called with the correct parameters
//       expect(
//         channelMemberService.checkChannelMemberPermission
//       ).toHaveBeenCalledWith(adminId, channelId);
//     });
//   });
// });
