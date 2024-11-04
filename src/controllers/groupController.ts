import { Request, Response, NextFunction } from 'express';
import * as groupService from '../services/groupService';
import { catchAsync, AppError } from '../utility';

export const getAllGroups = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const groups = await groupService.findAllGroups();
    res.status(200).json({
      status: 'success',
      results: groups.length,
      data: { data: groups },
    });
  }
);

export const getGroup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const group = await groupService.findGroupById(id);
    res.status(200).json({
      status: 'success',
      data: { data: group },
    });
  }
);

export const createGroup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, privacy, creatorId, groupSize } = req.body;
    const group = await groupService.createGroup({
      name,
      privacy,
      creatorId,
      groupSize,
    });
    res.status(201).json({
      status: 'success',
      data: { data: group },
    });
  }
);

export const updateGroup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const groupId = parseInt(req.params.id);
    const group = await groupService.updateGroup(groupId, req.body);
    res.status(200).json({
      status: 'success',
      data: { data: group },
    });
  }
);

export const deleteGroup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    await groupService.deleteGroup(id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

// permissions app admins only
// apply inappropriate content filter to a specific group chat
export const applyContentFilter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const groupId = req.params.groupId;
    const group = { name: 'group', filter: false };
    if (!group) {
      return next(new AppError('No Group found with that ID', 404));
    }

    group.filter = true;

    return res.status(200).json({
      status: 'success',
      data: {
        data: group,
      },
    });
  }
);
