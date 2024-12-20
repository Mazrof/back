// jest.mock('firebase-admin');
//
// import { Request, Response, NextFunction } from 'express';
// import {
//   getGroupMembers,
//   addGroupMember,
//   updateGroupMember,
//   inviteGroupMember,
//   deleteGroupMember,
// } from '../../controllers/groupMemberController';
// import * as groupMemberService from '../../services/groupMemberService';
// import {
//   checkGroupMemberExistence,
//   checkGroupMemberPermission,
// } from '../../services/groupMemberService';
// import { CommunityRole } from '@prisma/client';
//
// jest.mock('../../services/groupMemberService');
// jest.mock('../../server', () => ({
//   io: jest.fn(),
// }));
//
// describe('Group Member Controller', () => {
//   let mockRequest;
//   let mockResponse: Partial<Response>;
//   let mockNext: NextFunction;
//
//   beforeEach(() => {
//     jest.clearAllMocks();
//
//     mockResponse = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//
//     mockNext = jest.fn();
//
//     mockRequest = {
//       session: {
//         user: {
//           id: 1, // Mock user ID
//         },
//       },
//     };
//   });
//
//   describe('getGroupMembers', () => {
//     it('should fetch all members of a group successfully', async () => {
//       mockRequest.params = { groupId: '1' };
//       const mockMembers = [
//         {
//           userId: 1,
//           groupId: 1,
//           active: true,
//           hasDownloadPermissions: true,
//           role: CommunityRole.member,
//           users: { username: 'User1' },
//         },
//       ];
//
//       (checkGroupMemberExistence as jest.Mock).mockResolvedValue(undefined);
//       (groupMemberService.getGroupMembers as jest.Mock).mockResolvedValue(
//         mockMembers
//       );
//
//       await getGroupMembers(
//         mockRequest as Request,
//         mockResponse as Response,
//         mockNext
//       );
//
//       expect(checkGroupMemberExistence).toHaveBeenCalledWith(1, 1);
//       expect(groupMemberService.getGroupMembers).toHaveBeenCalledWith(1);
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith({
//         status: 'success',
//         results: mockMembers.length,
//         data: { members: mockMembers },
//       });
//     });
//
//     it('should handle errors when fetching group members', async () => {
//       const error = new Error('Service error');
//       mockRequest.params = { groupId: '1' };
//
//       (checkGroupMemberExistence as jest.Mock).mockRejectedValue(error);
//
//       await getGroupMembers(
//         mockRequest as Request,
//         mockResponse as Response,
//         mockNext
//       );
//
//       expect(checkGroupMemberExistence).toHaveBeenCalledWith(1, 1);
//       expect(mockNext).toHaveBeenCalledWith(error);
//     });
//   });
//
//   describe('addGroupMember', () => {
//     it('should add a new member to a group successfully', async () => {
//       mockRequest.params = { groupId: '1' };
//       mockRequest.body = { memberId: 2, role: CommunityRole.member };
//       const mockMember = {
//         userId: 2,
//         groupId: 1,
//         role: CommunityRole.member,
//       };
//
//       (checkGroupMemberPermission as jest.Mock).mockResolvedValue(undefined);
//       (groupMemberService.addGroupMember as jest.Mock).mockResolvedValue(
//         mockMember
//       );
//
//       await addGroupMember(
//         mockRequest as Request,
//         mockResponse as Response,
//         mockNext
//       );
//
//       expect(checkGroupMemberPermission).toHaveBeenCalledWith(1, 1);
//       expect(groupMemberService.addGroupMember).toHaveBeenCalledWith(
//         1,
//         1,
//         2,
//         CommunityRole.member
//       );
//       expect(mockResponse.status).toHaveBeenCalledWith(201);
//       expect(mockResponse.json).toHaveBeenCalledWith({
//         status: 'success',
//         data: { member: mockMember },
//       });
//     });
//
//     it('should handle errors when adding a new group member', async () => {
//       const error = new Error('Service error');
//       mockRequest.params = { groupId: '1' };
//       mockRequest.body = { memberId: 2, role: CommunityRole.member };
//
//       (checkGroupMemberPermission as jest.Mock).mockRejectedValue(error);
//
//       await addGroupMember(
//         mockRequest as Request,
//         mockResponse as Response,
//         mockNext
//       );
//
//       expect(mockNext).toHaveBeenCalledWith(error);
//     });
//   });
//
//   describe('updateGroupMember', () => {
//     it('should update a group member successfully', async () => {
//       mockRequest.params = { groupId: '1', id: '2' };
//       mockRequest.body = { role: CommunityRole.admin };
//       const mockMember = {
//         userId: 2,
//         groupId: 1,
//         role: CommunityRole.admin,
//       };
//
//       (checkGroupMemberPermission as jest.Mock).mockResolvedValue(undefined);
//       (groupMemberService.updateGroupMember as jest.Mock).mockResolvedValue(
//         mockMember
//       );
//
//       await updateGroupMember(
//         mockRequest as Request,
//         mockResponse as Response,
//         mockNext
//       );
//
//       expect(checkGroupMemberPermission).toHaveBeenCalledWith(1, 1);
//       expect(groupMemberService.updateGroupMember).toHaveBeenCalledWith(
//         1,
//         1,
//         2,
//         { role: CommunityRole.admin }
//       );
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith({
//         status: 'success',
//         data: { member: mockMember },
//       });
//     });
//
//     it('should handle errors when updating a group member', async () => {
//       const error = new Error('Service error');
//       mockRequest.params = { groupId: '1', id: '2' };
//
//       (checkGroupMemberPermission as jest.Mock).mockRejectedValue(error);
//
//       await updateGroupMember(
//         mockRequest as Request,
//         mockResponse as Response,
//         mockNext
//       );
//
//       expect(mockNext).toHaveBeenCalledWith(error);
//     });
//   });
//
//   describe('inviteGroupMember', () => {
//     it('should handle errors when inviting a group member', async () => {
//       const error = new Error('Service error');
//       mockRequest.body = {
//         token: 'invite-token',
//         memberId: 2,
//         role: CommunityRole.member,
//       };
//
//       (groupMemberService.joinGroupByInvite as jest.Mock).mockRejectedValue(
//         error
//       );
//
//       await inviteGroupMember(
//         mockRequest as Request,
//         mockResponse as Response,
//         mockNext
//       );
//
//       expect(mockNext).toHaveBeenCalledWith(error);
//     });
//   });
//
//   describe('deleteGroupMember', () => {
//     // it('should delete a group member successfully', async () => {
//     //   mockRequest.params = { groupId: '1' };
//     //   mockRequest.body = { userId: 2 };
//     //
//     //   (checkGroupMemberPermission as jest.Mock).mockResolvedValue(undefined);
//     //   (groupMemberService.deleteGroupMember as jest.Mock).mockResolvedValue(
//     //     undefined
//     //   );
//     //
//     //   await deleteGroupMember(
//     //     mockRequest as Request,
//     //     mockResponse as Response,
//     //     mockNext
//     //   );
//     //
//     //   expect(checkGroupMemberPermission).toHaveBeenCalledWith(1, 1);
//     //   expect(groupMemberService.deleteGroupMember).toHaveBeenCalledWith(1, 2);
//     //   expect(mockResponse.status).toHaveBeenCalledWith(204);
//     //   expect(mockResponse.json).toHaveBeenCalledWith({
//     //     status: 'success',
//     //     data: null,
//     //   });
//     // });
//
//     it('should handle errors when deleting a group member', async () => {
//       const error = new Error('Service error');
//       mockRequest.params = { groupId: '1' };
//       mockRequest.body = { userId: 2 };
//
//       (checkGroupMemberPermission as jest.Mock).mockRejectedValue(error);
//
//       await deleteGroupMember(
//         mockRequest as Request,
//         mockResponse as Response,
//         mockNext
//       );
//
//       expect(mockNext).toHaveBeenCalledWith(error);
//     });
//   });
// });
