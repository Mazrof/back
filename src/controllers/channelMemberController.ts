import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utility';
import { CommunityRole } from '@prisma/client';
import * as channelMemberService from '../services/channelMemberService';

/**
 * Controller to fetch all members of a channel.
 *
 * @param req - The request object, containing user ID and channel ID.
 * @param res - The response object used to send the list of members back to the client.
 * @param next - The next function to pass control to the next middleware.
 */
export const getChannelMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = req.session.user.id; // Get the ID of the current logged-in user from session
    const channelId: number = parseInt(req.params.channelId); // Get the channel ID from request parameters

    // Fetch the members of the channel using the service layer
    const members: {
      userId: number;
      channelId: number;
      active: boolean;
      hasDownloadPermissions: boolean;
      role: CommunityRole;
      users: { username: string };
    }[] = await channelMemberService.getChannelMembers(channelId, userId);

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
 * Controller to add a new member to the channel.
 *
 * @param req - The request object, containing user ID, role, and permissions.
 * @param res - The response object used to send back the added member's details.
 * @param next - The next function to pass control to the next middleware.
 */
export const addChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract member details from the request body
    const memberId: number = parseInt(req.body.userId); // The user ID to add
    const requesterId: number = req.session.user.id; // The ID of the person making the request (admin)
    const channelId: number = parseInt(req.params.channelId); // Channel ID from the route parameters
    const role: CommunityRole = req.body.role; // The role of the user to be added (admin, member, etc.)
    const hasDownloadPermissions = req.body.hasDownloadPermissions; // Whether the member has download permissions

    // Add the new member using the service layer
    const member = await channelMemberService.addChannelMember(
      memberId,
      channelId,
      requesterId,
      role,
      hasDownloadPermissions
    );

    // Respond with the member's data after they are added
    return res.status(201).json({
      status: 'success',
      data: {
        member,
      },
    });
  }
);

/**
 * Controller to update an existing channel member's details.
 *
 * @param req - The request object, containing the member's updated data and channel ID.
 * @param res - The response object used to send back the updated member's details.
 * @param next - The next function to pass control to the next middleware.
 */
export const updateChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract the user ID and channel ID from the request
    const userId: number = req.session.user.id; // The ID of the current logged-in user
    const channelId: number = parseInt(req.params.channelId); // Channel ID from the route parameter

    // Extract the member ID from the route parameters and update their details
    const memberId: number = parseInt(req.params.id); // The ID of the member to be updated

    // Update the member using the service layer
    const member = await channelMemberService.updateChannelMember(
      userId,
      channelId,
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
 * Controller to invite a user to join a channel using an invitation token.
 *
 * @param req - The request object containing the invitation token.
 * @param res - The response object used to send back the member's details after they join.
 * @param next - The next function to pass control to the next middleware.
 */
export const inviteChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.body.token; // The invitation token to join the channel
    const memberId: number = req.session.user.id; // The ID of the user inviting themselves to the channel

    // Use the service layer to join the channel using the invitation link
    const member: {
      channelId: number;
      userId: number;
      role: CommunityRole;
      hasDownloadPermissions: boolean;
    } = await channelMemberService.joinChannelByInvite(token, memberId);

    // Respond with the member's data after they join the channel
    return res.status(201).json({
      status: 'success',
      data: {
        member,
      },
    });
  }
);

/**
 * Controller to remove a member from the channel.
 *
 * @param req - The request object containing the member's ID and channel ID.
 * @param res - The response object used to confirm the member's deletion.
 * @param next - The next function to pass control to the next middleware.
 */
export const deleteChannelMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract the member and channel IDs from the request
    const memberId: number = parseInt(req.params.id); // The ID of the member to be deleted
    const userId: number = req.session.user.id; // The ID of the current logged-in user (admin)
    const channelId: number = parseInt(req.params.channelId); // The channel ID from the route parameters

    // Check if the current user is authorized to delete the member (only admins can delete members)
    if (memberId !== channelId) {
      await channelMemberService.checkChannelMemberPermission(
        userId,
        channelId
      );
    }

    // Call the service to delete the member
    await channelMemberService.deleteChannelMember(channelId, memberId);

    // Respond with a success message after the member is deleted
    return res.status(204).json({
      status: 'success',
      data: null, // No content to return as the member has been removed
    });
  }
);
