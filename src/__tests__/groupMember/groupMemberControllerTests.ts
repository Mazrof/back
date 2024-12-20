import { Request, Response, NextFunction } from 'express';
import { CommunityRole } from '@prisma/client';
import * as groupMemberService from '../../services/groupMemberService';
import {
  getGroupMembers,
  addGroupMember,
  updateGroupMember,
  inviteGroupMember,
  deleteGroupMember,
} from '../../controllers/groupMemberController';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

jest.mock('../../services/groupMemberService');
describe('Group Member Controller', () => {
  let mockRequest;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      session: {
        user: {
          id: 1,
          userType: 'admin',
          user: {
            /* Add any necessary user data here */
          },
        },
      },
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getGroupMembers', () => {
    const mockMembers = [
      {
        userId: 1,
        groupId: 1,
        active: true,
        hasDownloadPermissions: true,
        hasMessagePermissions: true,
        role: CommunityRole.admin,
        users: { username: 'testuser1' },
      },
      {
        userId: 2,
        groupId: 1,
        active: true,
        hasDownloadPermissions: false,
        hasMessagePermissions: true,
        role: CommunityRole.member,
        users: { username: 'testuser2' },
      },
    ];

    it('should return all group members successfully', async () => {
      mockRequest.params = { groupId: '1' };
      (groupMemberService.getGroupMembers as jest.Mock).mockResolvedValue(
        mockMembers
      );

      await getGroupMembers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupMemberService.getGroupMembers).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockMembers.length,
        data: { members: mockMembers },
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { groupId: '1' };
      const error = new Error('Service error');
      (groupMemberService.getGroupMembers as jest.Mock).mockRejectedValue(
        error
      );

      await getGroupMembers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('addGroupMember', () => {
    const mockMember = {
      userId: 2,
      groupId: 1,
      role: CommunityRole.member,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
    };

    it('should add group member successfully', async () => {
      mockRequest.params = { groupId: '1' };
      mockRequest.body = {
        memberId: '2',
        role: CommunityRole.member,
        hasDownloadPermissions: true,
        hasMessagePermissions: true,
      };
      (groupMemberService.addGroupMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      await addGroupMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupMemberService.addGroupMember).toHaveBeenCalledWith(
        1,
        1,
        2,
        CommunityRole.member,
        true,
        true
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { member: mockMember },
      });
    });

    it('should handle default permission values', async () => {
      mockRequest.params = { groupId: '1' };
      mockRequest.body = {
        memberId: '2',
        role: CommunityRole.member,
      };
      (groupMemberService.addGroupMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      await addGroupMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupMemberService.addGroupMember).toHaveBeenCalledWith(
        1,
        1,
        2,
        CommunityRole.member,
        false,
        false
      );
    });

    it('should handle service errors', async () => {
      mockRequest.params = { groupId: '1' };
      const error = new Error('Service error');
      (groupMemberService.addGroupMember as jest.Mock).mockRejectedValue(error);

      await addGroupMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateGroupMember', () => {
    const mockUpdatedMember = {
      userId: 2,
      groupId: 1,
      role: CommunityRole.admin,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
    };

    it('should update group member successfully', async () => {
      mockRequest.params = { groupId: '1', id: '2' };
      mockRequest.body = {
        role: CommunityRole.admin,
        hasDownloadPermissions: true,
        hasMessagePermissions: true,
      };
      (groupMemberService.updateGroupMember as jest.Mock).mockResolvedValue(
        mockUpdatedMember
      );

      await updateGroupMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupMemberService.updateGroupMember).toHaveBeenCalledWith(
        1,
        1,
        2,
        mockRequest.body
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { member: mockUpdatedMember },
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { groupId: '1', id: '2' };
      const error = new Error('Service error');
      (groupMemberService.updateGroupMember as jest.Mock).mockRejectedValue(
        error
      );

      await updateGroupMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('inviteGroupMember', () => {
    const mockInvitedMember = {
      groupId: 1,
      userId: 2,
      role: CommunityRole.member,
      hasDownloadPermissions: false,
      hasMessagePermissions: true,
    };

    it('should invite group member successfully', async () => {
      mockRequest.body = { token: 'valid-invite-token' };
      (groupMemberService.joinGroupByInvite as jest.Mock).mockResolvedValue(
        mockInvitedMember
      );

      await inviteGroupMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupMemberService.joinGroupByInvite).toHaveBeenCalledWith(
        'valid-invite-token',
        1
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { member: mockInvitedMember },
      });
    });

    it('should handle invalid token errors', async () => {
      mockRequest.body = { token: 'invalid-token' };
      const error = new Error('Invalid invitation token');
      (groupMemberService.joinGroupByInvite as jest.Mock).mockRejectedValue(
        error
      );

      await inviteGroupMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteGroupMember', () => {
    it('should delete group member successfully', async () => {
      mockRequest.params = { groupId: '1', id: '2' };
      (groupMemberService.deleteGroupMember as jest.Mock).mockResolvedValue(
        null
      );

      await deleteGroupMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupMemberService.deleteGroupMember).toHaveBeenCalledWith(
        1,
        1,
        2
      );
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });

    it('should handle unauthorized deletion attempts', async () => {
      mockRequest.params = { groupId: '1', id: '2' };
      const error = new Error('Not authorized to delete member');
      (groupMemberService.deleteGroupMember as jest.Mock).mockRejectedValue(
        error
      );

      await deleteGroupMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
