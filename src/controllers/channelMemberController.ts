import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import * as channelService from '../services/channelMemberService';
import { CommunityRole } from '@prisma/client';

export const getChannelMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const channelId: number = parseInt(req.params.channelId);
    const members: {
      userId: number;
      channelId: number;
      active: boolean;
      hasDownloadPermissions: boolean;
      role: CommunityRole;
      users: { username: string };
    }[] = await channelService.getChannelMembers(channelId);

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
    const memberId: number = parseInt(req.body.userId);
    const channelId: number = parseInt(req.params.channelId);

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
    const userId: number = parseInt(req.body.userId);
    const channelId: number = parseInt(req.params.channelId);
    const memberId: number = parseInt(req.params.id);
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
    const memberId: number = parseInt(req.body.userId);
    const channelId: number = parseInt(req.params.channelId);

    await channelService.deleteChannelMember(channelId, memberId);

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
