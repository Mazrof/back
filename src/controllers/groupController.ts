/**
 * Import required modules for handling HTTP requests and group services.
 */
import { Request, Response, NextFunction } from 'express';
import * as groupService from '../services/groupService';
import { catchAsync } from '../utility';

/**
 * Controller to fetch all groups.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing an array of group objects.
 * @throws {AppError} If no groups are found.
 */
export const getAllGroups = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const groups: {
      hasFilter: boolean;
      id: number;
      groupSize: number;
      community: { name: string; privacy: boolean; imageURL: string };
    }[] = await groupService.findAllGroups();

    return res.status(200).json({
      status: 'success',
      results: groups.length,
      data: {
        groups,
      },
    });
  }
);

/**
 * Controller to fetch a specific group by ID.
 *
 * @param {Request} req - The HTTP request object, containing group ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the group object.
 * @throws {AppError} If the group is not found or inactive.
 */
export const getGroup = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const id = parseInt(req.params.id);

    const group: {
      id: number;
      community: { name: string; privacy: boolean | null; imageURL: string };
      groupSize: number | null;
      hasFilter?: boolean;
    } = await groupService.findGroupById(id);

    return res.status(200).json({
      status: 'success',
      data: {
        group,
      },
    });
  }
);

/**
 * Controller to create a new group.
 *
 * @param {Request} req - The HTTP request object, containing group details in the request body.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the created group object.
 * @throws {AppError} If the input data is invalid.
 */
export const createGroup = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { name, privacy, groupSize, imageURL } = req.body;
    const creatorId: number = req.session.user.id;

    const group = await groupService.createGroup({
      name,
      privacy,
      creatorId,
      groupSize,
      imageURL,
    });

    return res.status(201).json({
      status: 'success',
      data: {
        group,
      },
    });
  }
);

/**
 * Controller to update an existing group.
 *
 * @param {Request} req - The HTTP request object, containing group details in the request body and group ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the updated group object.
 * @throws {AppError} If the user is not authorized or the input data is invalid.
 */
export const updateGroup = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const adminId: number = req.session.user.id;
    const groupId: number = parseInt(req.params.id);

    const group: {
      id: number;
      community: { name: string; privacy: boolean; imageURL: string };
      groupSize: number;
    } = await groupService.updateGroup(groupId, adminId, req.body);

    return res.status(200).json({
      status: 'success',
      data: {
        group,
      },
    });
  }
);

/**
 * Controller to delete a group by ID.
 *
 * @param {Request} req - The HTTP request object, containing group ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} A response with no content.
 * @throws {AppError} If the user is not authorized.
 */
export const deleteGroup = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const adminId: number = req.session.user.id;
    const groupId: number = parseInt(req.params.id);

    await groupService.deleteGroup(groupId, adminId);

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * Controller to apply or remove a content filter for a group.
 *
 * @param {Request} req - The HTTP request object, containing group ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the updated filter status for the group.
 * @throws {AppError} If the user is not authorized or the group is not found.
 */
export const applyContentFilter = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const groupId: number = parseInt(req.params.groupId);
    const adminId: number = req.session.user.id;

    const group: { adminId: number; groupId: number } =
      await groupService.applyGroupFilter(groupId, adminId);

    return res.status(200).json({
      status: 'success',
      data: {
        group,
      },
    });
  }
);
