import { Request, Response, NextFunction } from 'express';
import * as channelService from '../services/channelService';
import { catchAsync } from '../utility';

export const getAllChannels = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const channels: {
      id: number;
      canAddComments: boolean;
      community: { name: string; privacy: boolean };
    }[] = await channelService.findAllChannels();
    res.status(200).json({
      status: 'success',
      results: channels.length,
      data: {
        channels,
      },
    });
  }
);

export const getChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number = parseInt(req.params.id);
    const channel: {
      id: number;
      canAddComments: boolean;
      community: { name: string; privacy: boolean };
    } = await channelService.findChannelById(id);

    res.status(200).json({
      status: 'success',
      data: {
        channel,
      },
    });
  }
);

export const createChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, privacy, creatorId, canAddComments, admins } = req.body;
    const channel = await channelService.createChannel({
      name,
      privacy,
      creatorId,
      canAddComments,
      admins
    });
    res.status(201).json({
      status: 'success',
      data: {
        channel,
      },
    });
  }
);

export const updateChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const channelId: number = parseInt(req.params.id);
    const channel: {
      id: number;
      canAddComments: boolean;
      community: { name: string; privacy: boolean };
    } = await channelService.updateChannel(channelId, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        channel,
      },
    });
  }
);

export const deleteChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number = parseInt(req.params.id);
    await channelService.deleteChannel(id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
