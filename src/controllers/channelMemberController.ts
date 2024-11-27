import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import * as channelService from '../services/channelMemberService';
import { CommunityRole } from '@prisma/client';
import * as channelMemberService from '../services/channelMemberService';

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
        members,
      },
    });
  }
);

export const addChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const memberId: number = parseInt(req.body.userId);
    const channelId: number = parseInt(req.params.channelId);
    const role: CommunityRole = req.body.role;

    const member = await channelService.addChannelMember(
      memberId,
      channelId,
      role
    );

    return res.status(201).json({
      status: 'success',
      data: {
        member,
      },
    });
  }
);

export const updateChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = parseInt(req.body.userId);
    const channelId: number = parseInt(req.params.channelId);
    const memberId: number = parseInt(req.params.id);

    const member = await channelService.updateChannelMember(
      userId,
      channelId,
      memberId,
      req.body
    );

    return res.status(200).json({
      status: 'success',
      data: {
        member,
      },
    });
  }
);

export const inviteChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.body;
    const memberId: number = parseInt(req.body.memberId);
    const role = req.body.role;

    const member: {
      userId: number;
      channelId: number;
    } = await channelMemberService.joinChannelByInvite(token, memberId, role);

    return res.status(201).json({
      status: 'success',
      data: {
        member,
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
