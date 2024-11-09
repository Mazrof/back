import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import * as groupMemberService from '../services/groupMemberService';
import { joinGroupByInvite } from '../services/groupMemberService';

export const getGroupMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const groupId = parseInt(req.params.groupId);
    const members = await groupMemberService.getGroupMembers(groupId);

    return res.status(200).json({
      status: 'success',
      results: members.length,
      data: {
        data: members,
      },
    });
  }
);

export const addGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.body.userId);
    const groupId = parseInt(req.params.groupId);
    const memberId = parseInt(req.body.memberId);

    const member = await groupMemberService.addGroupMember(
      userId,
      groupId,
      memberId
    );

    return res.status(201).json({
      status: 'success',
      data: {
        data: member,
      },
    });
  }
);

export const inviteGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body;
    const memberId = parseInt(req.body.memberId);

    const member = await groupMemberService.joinGroupByInvite(token, memberId);

    return res.status(201).json({
      status: 'success',
      data: {
        data: member,
      },
    });
  }
);

export const updateGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.body.userId);
    const groupId = parseInt(req.params.groupId);
    const memberId = parseInt(req.params.id);
    const updates = req.body;

    const member = await groupMemberService.updateGroupMember(
      userId,
      groupId,
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

export const deleteGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.body.userId);
    const groupId = parseInt(req.params.groupId);
    const memberId = parseInt(req.params.id);

    await groupMemberService.deleteGroupMember(userId, groupId, memberId);

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
