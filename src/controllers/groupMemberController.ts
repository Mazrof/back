import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import * as groupMemberService from '../services/groupMemberService';
import { CommunityRole } from '@prisma/client';

/**
 * Controller to fetch all members of a group.
 *
 * @param req - The request object, containing user ID and group ID.
 * @param res - The response object used to send the list of members back to the client.
 * @param next - The next function to pass control to the next middleware.
 */
export const getGroupMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const userId: number = req.session.user.id; // Get the ID of the current logged-in user from session
    const groupId: number = parseInt(req.params.groupId); // Get the group ID from request parameters

    // Fetch the members of the group using the service layer
    const members: {
      role: CommunityRole;
      userId: number;
      groupId: number;
      hasDownloadPermissions: boolean;
      hasMessagePermissions: boolean;
      active: boolean;
      users: { username: string };
    }[] = await groupMemberService.getGroupMembers(groupId, userId);

    // Return the list of members with the total count
    return res.status(200).json({
      status: 'success',
      results: members.length, // Total number of members
      data: {
        members,
      },
    });
  }
);

/**
 * Controller to add a new member to the group.
 *
 * @param req - The request object, containing user ID, role, and permissions.
 * @param res - The response object used to send back the added member's details.
 * @param next - The next function to pass control to the next middleware.
 */
export const addGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const adminId: number = req.session.user.id; // The ID of the admin making the request
    const groupId: number = parseInt(req.params.groupId); // The ID of the group from the request params
    const memberId: number = parseInt(req.body.memberId); // The ID of the member to be added
    const role: CommunityRole = req.body.role; // The role of the member (admin, member, etc.)
    const hasDownloadPermissions: boolean = req.body.hasDownloadPermissions || false; // Permissions related to downloading
    const hasMessagePermissions: boolean = req.body.hasMessagePermissions || false; // Permissions related to messaging

    // Add the new member to the group using the service layer
    const member = await groupMemberService.addGroupMember(
      adminId,
      groupId,
      memberId,
      role,
      hasDownloadPermissions,
      hasMessagePermissions
    );

    // Return the newly added member's data
    return res.status(201).json({
      status: 'success',
      data: {
        member,
      },
    });
  }
);

/**
 * Controller to invite a user to join the group using an invitation token.
 *
 * @param req - The request object containing the invitation token.
 * @param res - The response object used to send back the member's details after they join.
 * @param next - The next function to pass control to the next middleware.
 */
export const inviteGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const token: string = req.body.token; // The invitation token to join the group
    const memberId: number = req.session.user.id; // The ID of the user inviting themselves to the group

    // Use the service layer to join the group using the invitation link
    const member = await groupMemberService.joinGroupByInvite(token, memberId);

    // Respond with the member's data after they join the group
    return res.status(201).json({
      status: 'success',
      data: {
        member,
      },
    });
  }
);

/**
 * Controller to update an existing group member's details.
 *
 * @param req - The request object, containing the member's updated data and group ID.
 * @param res - The response object used to send back the updated member's details.
 * @param next - The next function to pass control to the next middleware.
 */
export const updateGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const userId: number = req.session.user.id; // The ID of the current logged-in user
    const groupId: number = parseInt(req.params.groupId); // The ID of the group from the request params
    const memberId: number = parseInt(req.params.id); // The ID of the member to be updated

    // Update the member using the service layer
    const member = await groupMemberService.updateGroupMember(
      userId,
      groupId,
      memberId,
      req.body // The updated data for the member (e.g., role, permissions)
    );

    // Return the updated member's data
    return res.status(200).json({
      status: 'success',
      data: {
        member,
      },
    });
  }
);

/**
 * Controller to remove a member from the group.
 *
 * @param req - The request object containing the member's ID and group ID.
 * @param res - The response object used to confirm the member's deletion.
 * @param next - The next function to pass control to the next middleware.
 */
export const deleteGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const userId: number = req.session.user.id; // The ID of the current logged-in user (admin)
    const groupId: number = parseInt(req.params.groupId); // The ID of the group from the request params
    const memberId: number = parseInt(req.params.id); // The ID of the member to be deleted

    // Delete the member from the group using the service layer
    await groupMemberService.deleteGroupMember(userId, groupId, memberId);

    // Respond with a success message after the member is deleted
    return res.status(204).json({
      status: 'success',
      data: null, // No content to return as the member has been removed
    });
  }
);
