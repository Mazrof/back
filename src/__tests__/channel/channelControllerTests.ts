// Mock firebase-admin module
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn().mockReturnValue({}),
  },
  storage: jest.fn().mockReturnValue({
    bucket: jest.fn().mockReturnValue({}),
  }),
}));

import { Request, Response, NextFunction } from 'express';
import * as channelService from '../../services/channelService';
import {
  getAllChannels,
  getChannel,
  createChannel,
  updateChannel,
  deleteChannel,
} from '../../controllers/channelController';

jest.mock('../../services/channelService');
jest.mock('../../server', () => ({
  io: jest.fn(),
}));

describe('Channel Controller', () => {
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
          id: 1, // Mock admin ID
        },
      },
    };
  });

  describe('getAllChannels', () => {
    it('should fetch all channels successfully', async () => {
      const mockChannels = [
        {
          id: 1,
          canAddComments: true,
          community: { name: 'Channel1', privacy: true },
        },
        {
          id: 2,
          canAddComments: false,
          community: { name: 'Channel2', privacy: false },
        },
      ];

      (channelService.findAllChannels as jest.Mock).mockResolvedValue(
        mockChannels
      );

      await getAllChannels(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.findAllChannels).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockChannels.length,
        data: { channels: mockChannels },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors in fetching channels', async () => {
      const error = new Error('Service error');
      (channelService.findAllChannels as jest.Mock).mockRejectedValue(error);

      await getAllChannels(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.findAllChannels).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getChannel', () => {
    it('should fetch a single channel successfully', async () => {
      const mockChannel = {
        id: 1,
        canAddComments: true,
        community: { name: 'Channel1', privacy: true },
      };
      mockRequest.params = { id: '1' };

      (channelService.findChannelById as jest.Mock).mockResolvedValue(
        mockChannel
      );

      await getChannel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.findChannelById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { channel: mockChannel },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors in fetching a channel', async () => {
      const error = new Error('Service error');
      mockRequest.params = { id: '1' };

      (channelService.findChannelById as jest.Mock).mockRejectedValue(error);

      await getChannel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.findChannelById).toHaveBeenCalledWith(1);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createChannel', () => {
    it('should create a new channel successfully', async () => {
      const mockChannel = {
        id: 1,
        canAddComments: true,
        community: { name: 'Channel1', privacy: true },
      };
      mockRequest.body = {
        name: 'Channel1',
        privacy: true,
        canAddComments: true,
      };

      (channelService.createChannel as jest.Mock).mockResolvedValue(
        mockChannel
      );

      await createChannel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.createChannel).toHaveBeenCalledWith({
        name: 'Channel1',
        privacy: true,
        canAddComments: true,
        creatorId: 1, // Mock creatorId from session
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { channel: mockChannel },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors in creating a channel', async () => {
      const error = new Error('Service error');
      mockRequest.body = {
        name: 'Channel1',
        privacy: true,
        canAddComments: true,
      };

      (channelService.createChannel as jest.Mock).mockRejectedValue(error);

      await createChannel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.createChannel).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateChannel', () => {
    it('should update a channel successfully', async () => {
      const mockChannel = {
        id: 1,
        canAddComments: true,
        community: { name: 'Updated Channel', privacy: false },
      };
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated Channel', privacy: false };

      (channelService.updateChannel as jest.Mock).mockResolvedValue(
        mockChannel
      );

      await updateChannel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.updateChannel).toHaveBeenCalledWith(1, 1, {
        name: 'Updated Channel',
        privacy: false,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { channel: mockChannel },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors in updating a channel', async () => {
      const error = new Error('Service error');
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated Channel', privacy: false };

      (channelService.updateChannel as jest.Mock).mockRejectedValue(error);

      await updateChannel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.updateChannel).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteChannel', () => {
    it('should delete a channel successfully', async () => {
      mockRequest.params = { id: '1' };

      (channelService.deleteChannel as jest.Mock).mockResolvedValue(undefined);

      await deleteChannel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.deleteChannel).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors in deleting a channel', async () => {
      const error = new Error('Service error');
      mockRequest.params = { id: '1' };

      (channelService.deleteChannel as jest.Mock).mockRejectedValue(error);

      await deleteChannel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(channelService.deleteChannel).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
