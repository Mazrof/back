/**
 * Import required modules for handling HTTP requests and channel services.
 */
import { Request, Response, NextFunction } from 'express';
import * as channelService from '../services/channelService';
import { catchAsync } from '../utility';

/**
 * Controller to fetch all channels.
 * Fetches a list of all channels from the database.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing an array of channel objects.
 * @throws {AppError} If the channels cannot be fetched.
 */
export const getAllChannels = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const channels: {
      id: number;
      canAddComments: boolean;
      community: { name: string; privacy: boolean };
    }[] = await channelService.findAllChannels();

    res.status(200).json({
      status: 'success',
      results: channels.length,
      data: {
        channels,
      },
    });
  }
);

/**
 * Controller to fetch a single channel by ID.
 * Retrieves a specific channel's details based on the channel ID provided in the request parameters.
 *
 * @param {Request} req - The HTTP request object, containing the channel ID in the URL parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing a single channel object.
 * @throws {AppError} If the channel is not found.
 */
export const getChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const channelId: number = parseInt(req.params.id); // Channel ID from URL params
    const channel: {
      id: number;
      canAddComments: boolean;
      community: { name: string; privacy: boolean };
    } = await channelService.findChannelById(channelId);

    res.status(200).json({
      status: 'success',
      data: {
        channel,
      },
    });
  }
);

/**
 * Controller to create a new channel.
 * Accepts the details of a new channel from the request body and creates a new channel.
 *
 * @param {Request} req - The HTTP request object, containing the new channel details in the body.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the newly created channel object.
 * @throws {AppError} If the channel cannot be created.
 */
export const createChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, privacy, canAddComments, imageURL } = req.body; // Extracting channel details from the request body
    const creatorId = req.session.user.id; // ID of the user creating the channel

    const channel: {
      id: number;
      canAddComments: boolean;
      community: { name: string; privacy: boolean };
    } = await channelService.createChannel({
      name,
      privacy,
      creatorId,
      canAddComments,
      imageURL,
    });

    res.status(201).json({
      status: 'success',
      data: {
        channel, // Newly created channel details
      },
    });
  }
);

/**
 * Controller to update an existing channel.
 * Updates the properties of an existing channel if the requester is an admin of the channel.
 *
 * @param {Request} req - The HTTP request object, containing the channel ID in the URL parameter and updated data in the body.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the updated channel object.
 * @throws {AppError} If the user is not authorized or the channel is not found.
 */
export const updateChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const adminId: number = req.session.user.id; // ID of the admin performing the update
    const channelId: number = parseInt(req.params.id); // Channel ID from URL params

    const channel: {
      id: number;
      canAddComments: boolean;
      community: { name: string; privacy: boolean };
    } = await channelService.updateChannel(channelId, adminId, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        channel, // Updated channel details
      },
    });
  }
);

/**
 * Controller to delete an existing channel.
 * Deletes the channel if the requester is an admin of the channel.
 *
 * @param {Request} req - The HTTP request object, containing the channel ID in the URL parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response confirming the deletion of the channel.
 * @throws {AppError} If the user is not authorized or the channel is not found.
 */
export const deleteChannel = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const adminId: number = req.session.user.id; // ID of the admin performing the deletion
    const channelId: number = parseInt(req.params.id); // Channel ID from URL params

    await channelService.deleteChannel(channelId, adminId);

    res.status(204).json({
      status: 'success',
      data: null, // No content to return after deletion
    });
  }
);
