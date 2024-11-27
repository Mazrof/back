import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import * as groupMemberService from '../services/groupMemberService';
import { CommunityRole } from '@prisma/client';

export const getGroupMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const groupId: number = parseInt(req.params.groupId);

    const members: {
      role: CommunityRole;
      userId: number;
      groupId: number;
      hasDownloadPermissions: boolean;
      hasMessagePermissions: boolean;
      active: boolean;
      users: { username: string };
    }[] = await groupMemberService.getGroupMembers(groupId);

    return res.status(200).json({
      status: 'success',
      results: members.length,
      data: {
        members,
      },
    });
  }
);

export const addGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId: number = parseInt(req.body.userId);
    const groupId: number = parseInt(req.params.groupId);
    const memberId: number = parseInt(req.body.memberId);
    const role: CommunityRole = req.body.role;

    const member = await groupMemberService.addGroupMember(
      adminId,
      groupId,
      memberId,
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

export const inviteGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.body;
    const memberId: number = parseInt(req.body.memberId);
    const role = req.body.role;

    const member: {
      userId: number;
      groupId: number;
    } = await groupMemberService.joinGroupByInvite(token, memberId, role);

    return res.status(201).json({
      status: 'success',
      data: {
        member,
      },
    });
  }
);

export const updateGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.body.userId);
    const groupId = parseInt(req.params.groupId);
    const memberId = parseInt(req.params.id);

    const member = await groupMemberService.updateGroupMember(
      userId,
      groupId,
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

export const deleteGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = parseInt(req.body.userId);
    const groupId: number = parseInt(req.params.groupId);
    const memberId: number = parseInt(req.params.id);

    await groupMemberService.deleteGroupMember(userId, groupId, memberId);

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
