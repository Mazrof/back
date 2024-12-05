import { Request, Response, NextFunction } from 'express';
import {
  getAllGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  applyContentFilter,
} from '../../controllers/groupController';
import * as groupService from '../../services/groupService';

jest.mock('../../services/groupService');
jest.mock('../../server', () => ({
  io: jest.fn(),
}));

describe('Group Controller', () => {
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

  describe('getAllGroups', () => {
    it('should fetch all groups successfully', async () => {
      const mockGroups = [
        {
          id: 1,
          name: 'Group 1',
          privacy: 'private',
          groupSize: 10,
        },
      ];

      (groupService.findAllGroups as jest.Mock).mockResolvedValue(mockGroups);

      await getAllGroups(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupService.findAllGroups).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockGroups.length,
        data: { groups: mockGroups },
      });
    });

    it('should handle errors when fetching groups', async () => {
      const error = new Error('Service error');
      (groupService.findAllGroups as jest.Mock).mockRejectedValue(error);

      await getAllGroups(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getGroup', () => {
    it('should fetch a specific group successfully', async () => {
      const mockGroup = { id: 1, name: 'Group 1', privacy: 'private' };

      mockRequest.params = { id: '1' };
      (groupService.findGroupById as jest.Mock).mockResolvedValue(mockGroup);

      await getGroup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupService.findGroupById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { group: mockGroup },
      });
    });

    it('should handle errors when fetching a group', async () => {
      const error = new Error('Service error');
      mockRequest.params = { id: '1' };

      (groupService.findGroupById as jest.Mock).mockRejectedValue(error);

      await getGroup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createGroup', () => {
    it('should create a new group successfully', async () => {
      const mockGroup = {
        id: 1,
        name: 'New Group',
        privacy: 'private',
        groupSize: 10,
        admins: [1],
      };
      mockRequest.body = {
        name: 'New Group',
        privacy: 'private',
        groupSize: 10,
        admins: [1],
      };

      (groupService.createGroup as jest.Mock).mockResolvedValue(mockGroup);

      await createGroup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupService.createGroup).toHaveBeenCalledWith({
        name: 'New Group',
        privacy: 'private',
        creatorId: 1,
        groupSize: 10,
        admins: [1],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { group: mockGroup },
      });
    });

    it('should handle errors when creating a group', async () => {
      const error = new Error('Service error');
      mockRequest.body = {
        name: 'New Group',
        privacy: 'private',
        groupSize: 10,
        admins: [1],
      };

      (groupService.createGroup as jest.Mock).mockRejectedValue(error);

      await createGroup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateGroup', () => {
    it('should update a group successfully', async () => {
      const mockGroup = {
        id: 1,
        name: 'Updated Group',
        privacy: 'public',
        groupSize: 15,
      };
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Updated Group',
        privacy: 'public',
        groupSize: 15,
      };

      (groupService.updateGroup as jest.Mock).mockResolvedValue(mockGroup);

      await updateGroup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupService.updateGroup).toHaveBeenCalledWith(1, 1, {
        name: 'Updated Group',
        privacy: 'public',
        groupSize: 15,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { group: mockGroup },
      });
    });

    it('should handle errors when updating a group', async () => {
      const error = new Error('Service error');
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated Group' };

      (groupService.updateGroup as jest.Mock).mockRejectedValue(error);

      await updateGroup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group successfully', async () => {
      mockRequest.params = { id: '1' };

      (groupService.deleteGroup as jest.Mock).mockResolvedValue(undefined);

      await deleteGroup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupService.deleteGroup).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });

    it('should handle errors when deleting a group', async () => {
      const error = new Error('Service error');
      mockRequest.params = { id: '1' };

      (groupService.deleteGroup as jest.Mock).mockRejectedValue(error);

      await deleteGroup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('applyContentFilter', () => {
    it('should apply content filter to a group successfully', async () => {
      const mockGroup = {
        id: 1,
        name: 'Filtered Group',
        privacy: 'private',
        groupSize: 10,
      };
      mockRequest.params = { groupId: '1' };

      (groupService.applyGroupFilter as jest.Mock).mockResolvedValue(mockGroup);

      await applyContentFilter(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(groupService.applyGroupFilter).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { group: mockGroup },
      });
    });

    it('should handle errors when applying content filter', async () => {
      const error = new Error('Service error');
      mockRequest.params = { groupId: '1' };

      (groupService.applyGroupFilter as jest.Mock).mockRejectedValue(error);

      await applyContentFilter(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
