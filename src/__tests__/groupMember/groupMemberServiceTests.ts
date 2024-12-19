// import crypto from 'crypto';
// import * as groupMemberRepository from '../../repositories/groupMemberRepository';
// import * as groupRepository from '../../repositories/groupRepository';
// import * as userRepository from '../../repositories/adminRepository';
// import { CommunityRole } from '@prisma/client';
// import * as groupMemberService from '../../services/groupMemberService';
//
// jest.mock('../../server', () => ({
//   io: jest.fn(),
// }));
//
// jest.mock('crypto');
// jest.mock('../../repositories/groupMemberRepository');
// jest.mock('../../repositories/groupRepository');
// jest.mock('../../repositories/adminRepository', () => ({
//   findUserById: jest.fn(),
// }));
//
// describe('Group Member Service', () => {
//   let mockUser: { id: number; role: CommunityRole; active: boolean };
//
//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockUser = { id: 1, role: CommunityRole.admin, active: true };
//   });
//
//   describe('checkGroupMemberPermission', () => {
//     it('should throw an error if the user is not in the group or inactive', async () => {
//       (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
//         null
//       );
//
//       await expect(
//         groupMemberService.checkGroupMemberPermission(1, 1)
//       ).rejects.toThrow('this is no user with this id in the group');
//     });
//
//     it('should throw an error if the user is not an admin', async () => {
//       (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
//         {
//           ...mockUser,
//           role: CommunityRole.member,
//         }
//       );
//
//       await expect(
//         groupMemberService.checkGroupMemberPermission(1, 1)
//       ).rejects.toThrow('Not Authorized');
//     });
//
//     it('should pass if the user is an active admin', async () => {
//       (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
//         mockUser
//       );
//
//       await expect(
//         groupMemberService.checkGroupMemberPermission(1, 1)
//       ).resolves.not.toThrow();
//     });
//   });
//
//   describe('addGroupMember', () => {
//     it('should throw an error if the group does not exist', async () => {
//       (groupRepository.findGroupById as jest.Mock).mockResolvedValue(null);
//
//       await expect(
//         groupMemberService.addGroupMember(
//           1,
//           1,
//           2,
//           CommunityRole.member,
//           true,
//           true
//         )
//       ).rejects.toThrow('this is no group with this id');
//     });
//
//     it('should add a new member if checks pass', async () => {
//       // Mock the group existence
//       (groupRepository.findGroupById as jest.Mock).mockResolvedValue({ id: 1 });
//
//       // Mock the admin being a member of the group with admin role
//       (groupMemberRepository.findGroupMember as jest.Mock).mockResolvedValue({
//         id: 1,
//         groupId: 1,
//         userId: 1,
//         role: CommunityRole.admin,
//         active: true,
//       });
//
//       // Mock user check
//       (userRepository.findUserById as jest.Mock).mockResolvedValue({ id: 4 });
//
//       // Mock checking existing member (should return null)
//       (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
//         null
//       );
//
//       // Mock group capacity check
//       (groupMemberRepository.getMembersCount as jest.Mock).mockResolvedValue(
//         false
//       );
//
//       // Mock adding group member
//       const mockNewMember = {
//         groupId: 1,
//         userId: 4,
//         role: CommunityRole.member,
//       };
//       (groupMemberRepository.addGroupMember as jest.Mock).mockResolvedValue(
//         mockNewMember
//       );
//
//       const result = await groupMemberService.addGroupMember(
//         1,
//         1,
//         4,
//         CommunityRole.member,
//         true,
//         true
//       );
//
//       // Verify all checks and method calls
//       expect(groupRepository.findGroupById).toHaveBeenCalledWith(1);
//       expect(groupMemberRepository.findGroupMember).toHaveBeenCalledWith(1, 1);
//       expect(userRepository.findUserById).toHaveBeenCalledWith(4);
//       expect(groupMemberRepository.findExistingMember).toHaveBeenCalledWith(
//         4,
//         1
//       );
//       expect(groupMemberRepository.getMembersCount).toHaveBeenCalledWith(1);
//       expect(groupMemberRepository.addGroupMember).toHaveBeenCalledWith({
//         groupId: 1,
//         userId: 4,
//         role: CommunityRole.member,
//       });
//
//       expect(result).toEqual(mockNewMember);
//     });
//   });
//
//   describe('joinGroupByInvite', () => {
//     it('should throw an error for an invalid token', async () => {
//       (crypto.createHash as jest.Mock).mockReturnValue({
//         update: jest.fn().mockReturnThis(),
//         digest: jest.fn().mockReturnValue('hashed_token'),
//       });
//
//       (
//         groupMemberRepository.findGroupByInvitationLinkHash as jest.Mock
//       ).mockResolvedValue(null);
//
//       await expect(
//         groupMemberService.joinGroupByInvite(
//           'invalid_token',
//           1,
//           CommunityRole.member
//         )
//       ).rejects.toThrow('Invalid or expired invitation link');
//     });
//
//     it('should add a user to the group for a valid token', async () => {
//       const mockGroup = { id: 1 };
//       const mockMember = { groupId: 1, userId: 2, role: CommunityRole.member };
//
//       (crypto.createHash as jest.Mock).mockReturnValue({
//         update: jest.fn().mockReturnThis(),
//         digest: jest.fn().mockReturnValue('hashed_token'),
//       });
//
//       (
//         groupMemberRepository.findGroupByInvitationLinkHash as jest.Mock
//       ).mockResolvedValue(mockGroup);
//       (groupMemberRepository.addGroupMember as jest.Mock).mockResolvedValue(
//         mockMember
//       );
//
//       const result = await groupMemberService.joinGroupByInvite(
//         'valid_token',
//         2,
//         CommunityRole.member
//       );
//
//       expect(result).toEqual(mockMember);
//     });
//   });
//
//   describe('deleteGroupMember', () => {
//     it('should throw an error if the group does not exist', async () => {
//       (groupRepository.findGroupById as jest.Mock).mockResolvedValue(null);
//
//       await expect(
//         groupMemberService.deleteGroupMember(1, 1, 2)
//       ).rejects.toThrow('this is no group with this id');
//     });
//
//     it('should deactivate the member if they exist', async () => {
//       (groupRepository.findGroupById as jest.Mock).mockResolvedValue({ id: 1 });
//       (groupMemberRepository.findExistingMember as jest.Mock).mockResolvedValue(
//         mockUser
//       );
//       (
//         groupMemberRepository.updateGroupMemberStatus as jest.Mock
//       ).mockResolvedValue(true);
//
//       const result = await groupMemberService.deleteGroupMember(1, 1, 2);
//
//       expect(result).toBe(true);
//     });
//   });
//
//   describe('getGroupMembers', () => {
//     it('should throw an error if the group does not exist', async () => {
//       (groupRepository.findGroupById as jest.Mock).mockResolvedValue(null);
//
//       await expect(groupMemberService.getGroupMembers(1)).rejects.toThrow(
//         'this is no group with this id'
//       );
//     });
//
//     it('should return group members if the group exists', async () => {
//       (groupRepository.findGroupById as jest.Mock).mockResolvedValue({ id: 1 });
//       (groupMemberRepository.findGroupMembers as jest.Mock).mockResolvedValue([
//         { id: 1, role: CommunityRole.admin },
//         { id: 2, role: CommunityRole.member },
//       ]);
//
//       const result = await groupMemberService.getGroupMembers(1);
//
//       expect(result).toEqual([
//         { id: 1, role: CommunityRole.admin },
//         { id: 2, role: CommunityRole.member },
//       ]);
//     });
//   });
// });
