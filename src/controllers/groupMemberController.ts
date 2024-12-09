import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import * as groupMemberService from '../services/groupMemberService';
import { CommunityRole } from '@prisma/client';
import { checkGroupMember, checkGroupMemberPermission } from '../services';

export const getGroupMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // check that the user is a member in this group
    const userId = req.session.user.id;
    const groupId: number = parseInt(req.params.groupId);

    await checkGroupMember(userId, groupId);

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
    // check that the user is an admin in this group
    const adminId: number = req.session.user.id;
    const groupId: number = parseInt(req.params.groupId);
    await checkGroupMemberPermission(adminId, groupId);

    const memberId: number = parseInt(req.body.memberId);
    const role: CommunityRole = req.body.role;
    const hasDownloadPermissions: boolean =
      req.body.hasDownloadPermissions || false;
    const hasMessagePermissions: boolean =
      req.body.hasMessagePermissions || false;

    const member = await groupMemberService.addGroupMember(
      adminId,
      groupId,
      memberId,
      role,
      hasDownloadPermissions,
      hasMessagePermissions
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
    const memberId: number = req.session.user.id;
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
    // check that the user is an admin in this group
    const userId: number = req.session.user.id;
    const groupId = parseInt(req.params.groupId);

    await checkGroupMemberPermission(userId, groupId);

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
    // check that the user is an admin in this group

    const userId: number = req.session.user.id;
    const groupId: number = parseInt(req.params.groupId);

    await checkGroupMemberPermission(userId, groupId);
    const memberId: number = parseInt(req.params.id);

    await groupMemberService.deleteGroupMember(userId, groupId, memberId);

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
