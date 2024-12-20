jest.mock('firebase-admin');

import { Request, Response, NextFunction } from 'express';
import {
  getChannelMembers,
  addChannelMember,
  updateChannelMember,
  inviteChannelMember,
  deleteChannelMember,
} from '../../controllers/channelMemberController';
import * as channelService from '../../services/channelMemberService';
import {
  checkChannelMember,
  checkChannelMemberPermission,
} from '../../services/channelMemberService';
import { CommunityRole } from '@prisma/client';

jest.mock('../../services/channelMemberService');
jest.mock('../../server', () => ({
  io: jest.fn(),
}));
describe('Channel Member Controller', () => {
  let mockRequest;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    mockRequest = {
      session: {
        user: {
          id: 1, // Mock user ID
        },
      },
    };
  });

  describe('getChannelMembers', () => {
    it('should fetch all members of a channel successfully', async () => {
      mockRequest.params = { channelId: '1' };
      const mockMembers = [
        {
          userId: 1,
          channelId: 1,
          active: true,
          hasDownloadPermissions: true,
          role: CommunityRole.member,
          users: { username: 'User1' },
        },
      ];

      (checkChannelMember as jest.Mock).mockResolvedValue(undefined);
      (channelService.getChannelMembers as jest.Mock).mockResolvedValue(
        mockMembers
      );

      await getChannelMembers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(checkChannelMember).toHaveBeenCalledWith(1, 1);
      expect(channelService.getChannelMembers).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockMembers.length,
        data: { members: mockMembers },
      });
    });

    it('should handle errors when fetching members', async () => {
      const error = new Error('Service error');
      mockRequest.params = { channelId: '1' };

      (checkChannelMember as jest.Mock).mockRejectedValue(error);

      await getChannelMembers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(checkChannelMember).toHaveBeenCalledWith(1, 1);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('addChannelMember', () => {
    it('should add a new member to a channel successfully', async () => {
      mockRequest.params = { channelId: '1' };
      mockRequest.body = { userId: 2, role: CommunityRole.member };
      const mockMember = {
        userId: 2,
        channelId: 1,
        role: CommunityRole.member,
      };

      (checkChannelMemberPermission as jest.Mock).mockResolvedValue(undefined);
      (channelService.addChannelMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      await addChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(checkChannelMemberPermission).toHaveBeenCalledWith(1, 1);
      expect(channelService.addChannelMember).toHaveBeenCalledWith(
        2,
        1,
        CommunityRole.member
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { member: mockMember },
      });
    });

    it('should handle errors when adding a new member', async () => {
      const error = new Error('Service error');
      mockRequest.params = { channelId: '1' };
      mockRequest.body = { userId: 2, role: CommunityRole.member };

      (checkChannelMemberPermission as jest.Mock).mockRejectedValue(error);

      await addChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateChannelMember', () => {
    it('should update a channel member successfully', async () => {
      mockRequest.params = { channelId: '1', id: '2' };
      mockRequest.body = { role: CommunityRole.admin };
      const mockMember = {
        userId: 2,
        channelId: 1,
        role: CommunityRole.admin,
      };

      (checkChannelMemberPermission as jest.Mock).mockResolvedValue(undefined);
      (channelService.updateChannelMember as jest.Mock).mockResolvedValue(
        mockMember
      );

      await updateChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(checkChannelMemberPermission).toHaveBeenCalledWith(1, 1);
      expect(channelService.updateChannelMember).toHaveBeenCalledWith(1, 1, 2, {
        role: CommunityRole.admin,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { member: mockMember },
      });
    });

    it('should handle errors when updating a channel member', async () => {
      const error = new Error('Service error');
      mockRequest.params = { channelId: '1', id: '2' };

      (checkChannelMemberPermission as jest.Mock).mockRejectedValue(error);

      await updateChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('inviteChannelMember', () => {
    // it('should add a member by invite successfully', async () => {
    //   const mockMember = { userId: 2, channelId: 1 };
    //
    //   // Mock the service method that handles the invite
    //   (channelService.joinChannelByInvite as jest.Mock).mockResolvedValue(
    //     mockMember
    //   );
    //
    //   // Call the function with mock data
    //   await inviteChannelMember(
    //     mockRequest as Request,
    //     mockResponse as Response,
    //     mockNext
    //   );
    //
    //   // Check if the joinChannelByInvite function was called with the correct arguments
    //   expect(channelService.joinChannelByInvite).toHaveBeenCalledWith(
    //     'invite-token', // token from the request body
    //     1, // memberId from session (the current user ID)
    //     'member' // role from the request body
    //   );
    //
    //   // Ensure the response was correctly sent
    //   expect(mockResponse.status).toHaveBeenCalledWith(201);
    //   expect(mockResponse.json).toHaveBeenCalledWith({
    //     status: 'success',
    //     data: { member: mockMember },
    //   });
    // });

    it('should handle errors when inviting a channel member', async () => {
      const error = new Error('Service error');
      mockRequest.body = {
        token: 'invite-token',
        memberId: 2,
        role: 'member',
      };

      (channelService.joinChannelByInvite as jest.Mock).mockRejectedValue(
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
    it('should delete a channel member successfully', async () => {
      mockRequest.params = { channelId: '1' };
      mockRequest.body = { userId: 2 };

      (checkChannelMemberPermission as jest.Mock).mockResolvedValue(undefined);
      (channelService.deleteChannelMember as jest.Mock).mockResolvedValue(
        undefined
      );

      await deleteChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(checkChannelMemberPermission).toHaveBeenCalledWith(1, 1);
      expect(channelService.deleteChannelMember).toHaveBeenCalledWith(1, 2);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });

    it('should handle errors when deleting a channel member', async () => {
      const error = new Error('Service error');
      mockRequest.params = { channelId: '1' };
      mockRequest.body = { userId: 2 };

      (checkChannelMemberPermission as jest.Mock).mockRejectedValue(error);

      await deleteChannelMember(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
