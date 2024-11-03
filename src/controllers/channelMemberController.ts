import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import * as channelService from '../services/channelMemberService';

export const getChannelMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const channelId = parseInt(req.params.channelId);
    const members = await channelService.getChannelMembers(channelId);

    return res.status(200).json({
      status: 'success',
      results: members.length,
      data: {
        data: members,
      },
    });
  }
);

export const addChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const memberId = parseInt(req.body.userId);
    const channelId = parseInt(req.params.channelId);

    const member = await channelService.addChannelMember(memberId, channelId);

    return res.status(201).json({
      status: 'success',
      data: {
        data: member,
      },
    });
  }
);

export const updateChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.body.userId);
    const channelId = parseInt(req.params.channelId);
    const memberId = parseInt(req.params.id);
    const updates = req.body;

    const member = await channelService.updateChannelMember(
      userId,
      channelId,
      memberId,
      updates
    );

    return res.status(200).json({
      status: 'success',
      data: {
        data: member,
      },
    });
  }
);

export const deleteChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const memberId = parseInt(req.body.userId);
    const channelId = parseInt(req.params.channelId);

    await channelService.deleteChannelMember(channelId, memberId);

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
