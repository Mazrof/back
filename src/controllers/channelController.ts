import { Request, Response, NextFunction } from 'express';
import * as channelService from '../services/channelService';
import { catchAsync, AppError } from '../utility';
import { channel } from 'node:diagnostics_channel';

export const getAllChannels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const channels = await channelService.findAllChannels();
    res.status(200).json({
      status: 'success',
      results: channels.length,
      data: { data: channels },
    });
  }
);

export const getChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const channel = await channelService.findChannelById(id);
    res.status(200).json({
      status: 'success',
      data: { data: channel },
    });
  }
);

export const createChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, privacy, creatorId, canAddComments } = req.body;
    const channel = await channelService.createChannel({
      name,
      privacy,
      creatorId,
      canAddComments,
    });
    res.status(201).json({
      status: 'success',
      data: { data: channel },
    });
  }
);

export const updateChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const channelId = parseInt(req.params.id);
    const channel = await channelService.updateChannel(channelId, req.body);

    res.status(200).json({
      status: 'success',
      data: { data: channel },
    });
  }
);

export const deleteChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    await channelService.deleteChannel(id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
