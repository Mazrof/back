import { Request, Response, NextFunction } from 'express';
import { CommunityRole } from '@prisma/client';
import * as channelMemberService from '../../services/channelMemberService';
import {
  getChannelMembers,
  addChannelMember,
  updateChannelMember,
  inviteChannelMember,
  deleteChannelMember,
} from '../../controllers/channelMemberController';

jest.mock('../../server', () => ({
  io: jest.fn(),
}));

jest.mock('../../services/channelMemberService');

describe('Channel Member Controller', () => {
  let mockRequest;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      session: {
        user: {
          id: 1,
        },
        // Include other required properties like `id`, `cookie`, `regenerate`, etc.
        id: 'mock-session-id', // Add a mock session ID
        cookie: {
          originalMaxAge: 0,
          expires: new Date(),
          httpOnly: true,
          secure: false,
        },
        regenerate: jest.fn(),
        destroy: jest.fn(),
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

  describe('getChannelMembers', () => {
    const mockMembers = [
      {
        userId: 1,
        channelId: 1,
        active: true,
        hasDownloadPermissions: true,
        role: CommunityRole.admin,
        users: { username: 'testuser1' },
      },
      {
        userId: 2,
        channelId: 1,
        active: true,
        hasDownloadPermissions: false,
        role: CommunityRole.member,
        users: { username: 'testuser2' },
      },
    ];

    it('should return all channel members successfully', async () => {
      mockRequest.params = { channelId: '1' };
      (channelMemberService.getChannelMembers as jest.Mock).mockResolvedValue(
        mockMembers
      );

      await getChannelMembers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelMemberService.getChannelMembers).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockMembers.length,
        data: { members: mockMembers },
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { channelId: '1' };
      const error = new Error('Service error');
      (channelMemberService.getChannelMembers as jest.Mock).mockRejectedValue(
        error
      );

      await getChannelMembers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('addChannelMember', () => {
    const mockMember = {
      userId: 2,
      channelId: 1,
      role: CommunityRole.member,
      hasDownloadPermissions: true,
    };

    it('should add channel member successfully', async () => {
      mockRequest.params = { channelId: '1' };
      mockRequest.body = {
        userId: '2',
        role: CommunityRole.member,
        hasDownloadPermissions: true,
      };
      (channelMemberService.addChannelMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      await addChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelMemberService.addChannelMember).toHaveBeenCalledWith(
        2,
        1,
        1,
        CommunityRole.member,
        true
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { member: mockMember },
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { channelId: '1' };
      const error = new Error('Service error');
      (channelMemberService.addChannelMember as jest.Mock).mockRejectedValue(
        error
      );

      await addChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateChannelMember', () => {
    const mockUpdatedMember = {
      userId: 2,
      channelId: 1,
      role: CommunityRole.admin,
      hasDownloadPermissions: true,
    };

    it('should update channel member successfully', async () => {
      mockRequest.params = { channelId: '1', id: '2' };
      mockRequest.body = {
        role: CommunityRole.admin,
        hasDownloadPermissions: true,
      };
      (channelMemberService.updateChannelMember as jest.Mock).mockResolvedValue(
        mockUpdatedMember
      );

      await updateChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelMemberService.updateChannelMember).toHaveBeenCalledWith(
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
      mockRequest.params = { channelId: '1', id: '2' };
      const error = new Error('Service error');
      (channelMemberService.updateChannelMember as jest.Mock).mockRejectedValue(
        error
      );

      await updateChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('inviteChannelMember', () => {
    const mockInvitedMember = {
      channelId: 1,
      userId: 2,
      role: CommunityRole.member,
      hasDownloadPermissions: false,
    };

    it('should invite channel member successfully', async () => {
      mockRequest.body = { token: 'valid-invite-token' };
      (channelMemberService.joinChannelByInvite as jest.Mock).mockResolvedValue(
        mockInvitedMember
      );

      await inviteChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelMemberService.joinChannelByInvite).toHaveBeenCalledWith(
        'valid-invite-token',
        1
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { member: mockInvitedMember },
      });
    });

    it('should handle service errors', async () => {
      mockRequest.body = { token: 'invalid-token' };
      const error = new Error('Invalid invitation token');
      (channelMemberService.joinChannelByInvite as jest.Mock).mockRejectedValue(
        error
      );

      await inviteChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteChannelMember', () => {
    it('should delete channel member successfully', async () => {
      mockRequest.params = { channelId: '1', id: '2' };
      (channelMemberService.deleteChannelMember as jest.Mock).mockResolvedValue(
        null
      );
      (
        channelMemberService.checkChannelMemberPermission as jest.Mock
      ).mockResolvedValue(true);

      await deleteChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(
        channelMemberService.checkChannelMemberPermission
      ).toHaveBeenCalledWith(1, 1);
      expect(channelMemberService.deleteChannelMember).toHaveBeenCalledWith(
        1,
        2
      );
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });

    it('should skip permission check when member deletes themselves', async () => {
      mockRequest.params = { channelId: '1', id: '1' };
      (channelMemberService.deleteChannelMember as jest.Mock).mockResolvedValue(
        null
      );

      await deleteChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(
        channelMemberService.checkChannelMemberPermission
      ).not.toHaveBeenCalled();
      expect(channelMemberService.deleteChannelMember).toHaveBeenCalledWith(
        1,
        1
      );
    });

    it('should handle permission check errors', async () => {
      mockRequest.params = { channelId: '1', id: '2' };
      const error = new Error('Not authorized');
      (
        channelMemberService.checkChannelMemberPermission as jest.Mock
      ).mockRejectedValue(error);

      await deleteChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(channelMemberService.deleteChannelMember).not.toHaveBeenCalled();
    });
  });
});
