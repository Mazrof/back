import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import { CommunityRole } from '@prisma/client';
import * as channelMemberService from '../services/channelMemberService';

export const getChannelMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // check that the user is a user in this channel
    const userId: number = req.session.user.id;
    const channelId: number = parseInt(req.params.channelId);

    await channelMemberService.checkChannelMember(userId, channelId);

    const members: {
      userId: number;
      channelId: number;
      active: boolean;
      hasDownloadPermissions: boolean;
      role: CommunityRole;
      users: { username: string };
    }[] = await channelMemberService.getChannelMembers(channelId);

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
    // check that the user is an admin in this channel
    const memberId: number = parseInt(req.body.userId);

    const userId: number = req.session.user.id;
    const channelId: number = parseInt(req.params.channelId);
    const role: CommunityRole = req.body.role;
    if (role === CommunityRole.admin) {
      await channelMemberService.checkChannelMemberPermission(
        userId,
        channelId
      );
    }

    const hasDownloadPermissions = req.body.hasDownloadPermissions;

    const member = await channelMemberService.addChannelMember(
      memberId,
      channelId,
      role,
      hasDownloadPermissions
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
    // check that the user is an admin in this channel
    const userId: number = req.session.user.id;
    const channelId: number = parseInt(req.params.channelId);
    console.log(userId);
    // await channelMemberService.checkChannelMemberPermission(userId, channelId);
    const memberId: number = parseInt(req.params.id);

    const member = await channelMemberService.updateChannelMember(
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
    const memberId: number = req.session.user.id;
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
    // check that the user is an admin in this channel
    const memberId: number = parseInt(req.params.id);
    const userId: number = req.session.user.id;
    const channelId: number = parseInt(req.params.channelId);

    await channelMemberService.checkChannelMemberPermission(userId, channelId);

    await channelMemberService.deleteChannelMember(channelId, memberId);

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
