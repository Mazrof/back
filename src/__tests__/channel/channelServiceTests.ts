// jest.mock('firebase-admin');
//
// import * as channelRepository from '../../repositories/channelRepository';
// import * as communityRepository from '../../repositories/communityRepository';
// import generateInvitationLink from '../../utility/invitationLink';
// import * as channelMemberService from '../../services/channelMemberService';
//
// import { CommunityRole } from '@prisma/client';
// import { AppError } from '../../utility';
// import * as channelService from '../../services/channelService';
// import { getFileFromFirebase, uploadFileToFirebase } from '../../third_party_services';
//
// jest.mock('../../server', () => ({
//   io: jest.fn(),
// }));
//
// jest.mock('../../repositories/channelRepository');
// jest.mock('../../repositories/communityRepository');
// jest.mock('../../utility/invitationLink');
// jest.mock('../../services/channelMemberService');
// jest.mock('../../third_party_services');
//
// describe('Channel Service', () => {
//   let mockData;
//
//   beforeEach(() => {
//     jest.clearAllMocks();
//
//     mockData = {
//       name: 'Test Channel',
//       creatorId: 1,
//       privacy: true,
//       canAddComments: true,
//       imageURL: 'https://imageurl.com/test.jpg',
//     };
//   });
//
//   describe('checkData', () => {
//     it('should throw an error if channel name is missing', () => {
//       const invalidData = { ...mockData, name: '' };
//       expect(() => channelService.checkData(invalidData)).toThrow(AppError);
//     });
//
//     it('should throw an error if creatorId is missing', () => {
//       const invalidData = { ...mockData, creatorId: undefined };
//       expect(() => channelService.checkData(invalidData)).toThrow(AppError);
//     });
//
//     it('should not throw an error if all required fields are present', () => {
//       expect(() => channelService.checkData(mockData)).not.toThrow(AppError);
//     });
//   });
//
//   describe('findAllChannels', () => {
//     it('should return a list of channels', async () => {
//       const mockChannels = [{ id: 1, name: 'Test Channel' }];
//       (channelRepository.findAllChannels as jest.Mock).mockResolvedValue(mockChannels);
//
//       const result = await channelService.findAllChannels();
//       expect(result).toEqual(mockChannels);
//       expect(channelRepository.findAllChannels).toHaveBeenCalledTimes(1);
//     });
//   });
//
//   describe('findChannelById', () => {
//     it('should return a channel if it exists', async () => {
//       const mockChannel = {
//         id: 1,
//         canAddComments: true,
//         community: {
//           name: 'Test Channel',
//           privacy: true,
//           active: true,
//           imageURL: 'https://imageurl.com/test.jpg',
//         },
//       };
//
//       (channelRepository.findChannelById as jest.Mock).mockResolvedValue(mockChannel);
//
//       const result = await channelService.findChannelById(1);
//       expect(result).toEqual(mockChannel);
//     });
//
//     it('should throw an error if no channel is found or community is inactive', async () => {
//       (channelRepository.findChannelById as jest.Mock).mockResolvedValue(null);
//       await expect(channelService.findChannelById(999)).rejects.toThrow(AppError);
//     });
//   });
//
//   describe('createChannel', () => {
//     it('should create a new channel', async () => {
//       const mockChannel = {
//         id: 1,
//         canAddComments: true,
//         community: {
//           name: 'Test Channel',
//           privacy: true,
//         },
//       };
//
//       (generateInvitationLink as jest.Mock).mockReturnValue('invitationLink123');
//       (uploadFileToFirebase as jest.Mock).mockResolvedValue('firebaseImageUrl');
//       (channelRepository.createChannel as jest.Mock).mockResolvedValue(mockChannel);
//       (getFileFromFirebase as jest.Mock).mockResolvedValue('firebaseImageUrl');
//       (channelMemberService.addChannelMember as jest.Mock).mockResolvedValue(null);
//
//       const result = await channelService.createChannel(mockData);
//
//       expect(result).toEqual(mockChannel);
//       expect(generateInvitationLink).toHaveBeenCalled();
//       // expect(uploadFileToFirebase).toHaveBeenCalledWith(mockData.imageURL);
//       expect(channelRepository.createChannel).toHaveBeenCalledWith({
//         ...mockData,
//         invitationLink: 'invitationLink123',
//       });
//       expect(channelMemberService.addChannelMember).toHaveBeenCalledWith(
//         mockData.creatorId,
//         mockChannel.id,
//         null,
//         CommunityRole.admin,
//         true
//       );
//     });
//
//     it('should throw an error if data is invalid', async () => {
//       const invalidData = { ...mockData, name: '' };
//       await expect(channelService.createChannel(invalidData)).rejects.toThrow(AppError);
//     });
//   });
//
//   describe('updateChannel', () => {
//     it('should update an existing channel', async () => {
//       const mockUpdatedChannel = {
//         id: 1,
//         canAddComments: true,
//         community: { name: 'Updated Channel', privacy: true, imageURL: 'https://updatedimageurl.com' },
//       };
//
//       const mockData = { name: 'Updated Channel', imageURL: 'updatedImage.jpg' };
//
//       // Mocking dependencies
//       (channelMemberService.checkChannelMemberPermission as jest.Mock).mockResolvedValue(null);
//       (uploadFileToFirebase as jest.Mock).mockResolvedValue('updatedImageUrl');
//       (communityRepository.updateCommunity as jest.Mock).mockResolvedValue(null);
//       (channelRepository.updateChannel as jest.Mock).mockResolvedValue(mockUpdatedChannel);
//       (getFileFromFirebase as jest.Mock).mockResolvedValue('updatedImageUrl');
//
//       // Mock findChannelById to return a mock channel
//       (channelRepository.findChannelById as jest.Mock).mockResolvedValue({
//         id: 1,
//         canAddComments: true,
//         communityId: 1,
//         community: { name: 'Test Channel', privacy: true, active: true, imageURL: 'https://testimage.com' },
//       });
//
//       // Call the updateChannel method
//       const result = await channelService.updateChannel(1, 1, mockData);
//
//       // Assertions
//       expect(result).toEqual(mockUpdatedChannel);
//       // expect(uploadFileToFirebase).toHaveBeenCalledWith(mockData.imageURL);
//       expect(communityRepository.updateCommunity).toHaveBeenCalledWith(1, {
//         name: 'Updated Channel',
//         privacy: true,
//         imageURL: 'updatedImageUrl',
//       });
//       expect(channelRepository.updateChannel).toHaveBeenCalledWith(1, mockUpdatedChannel.canAddComments);
//     });
//
//     it('should throw an error if no data to update is provided', async () => {
//       await expect(channelService.updateChannel(1, 1, {})).rejects.toThrow(AppError);
//     });
//   });
//
//   describe('deleteChannel', () => {
//
//     it('should throw an error if the channel is not found', async () => {
//       // Simulate that the channel is not found
//       (channelService.findChannelById as jest.Mock).mockResolvedValue(null);
//
//       // Verifying that the function throws an error if the channel is not found
//       await expect(channelService.deleteChannel(1, 1)).rejects.toThrow('No channel found with that ID');
//     });
//   });
//
//     it('should delete a channel successfully', async () => {
//       (channelService.findChannelById as jest.Mock).mockResolvedValue({
//         id: 1,
//         communityId: 1,
//         community: { active: true },
//       });
//
//       // Mock other service calls
//       (channelMemberService.checkChannelMemberPermission as jest.Mock).mockResolvedValue(null);
//       (communityRepository.updateCommunity as jest.Mock).mockResolvedValue(null);
//
//       await channelService.deleteChannel(1, 1);
//
//       expect(channelMemberService.checkChannelMemberPermission).toHaveBeenCalledWith(1, 1);
//       expect(communityRepository.updateCommunity).toHaveBeenCalledWith(1, { active: false });
//     });
//
//     it('should throw an error if no permission to delete', async () => {
//       (channelMemberService.checkChannelMemberPermission as jest.Mock).mockRejectedValue(new Error('Permission Denied'));
//
//       await expect(channelService.deleteChannel(1, 1)).rejects.toThrow(AppError);
//     });
//
// });
