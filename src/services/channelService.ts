import * as channelRepository from '../repositories/channelRepository';
import * as communityRepository from '../repositories/communityRepository';
import generateInvitationLink from '../utility/invitationLink';
import * as channelMemberService from '../services/channelMemberService';
import { CommunityRole } from '@prisma/client';
import { AppError } from '../utility';
import {
  channelResponse,
  commonChannelResponse,
} from '../repositories/repositoriesTypes/channelTypes';
import {
  convertBase64ToImage,
  convertImageToBase64,
  saveImage,
} from '../middlewares/imageHandlers';

/**
 * Checks the validity of the input data for creating or updating a channel.
 *
 * @param {Object} data - The data to check.
 * @param {string} data.name - The name of the channel.
 * @param {number} data.creatorId - The ID of the creator of the channel.
 * @param {boolean} [data.privacy] - The privacy setting of the channel (optional).
 * @param {boolean} [data.canAddComments] - Whether users can add comments in the channel (optional).
 * @param {string} [data.imageURL] - The image URL for the channel (optional).
 * @throws {AppError} If required data is missing, an error is thrown.
 */
export const checkData = (data: {
  name: string;
  privacy?: boolean;
  creatorId: number;
  canAddComments?: boolean;
  imageURL?: string;
}): void => {
  let message: string = '';
  if (!data.name) {
    message = 'Invalid Group name';
  }
  if (!data.creatorId) {
    if (message) message += ', ';
    message += 'Invalid Creator ID';
  }
  if (message) {
    throw new AppError(`${message}`, 400);
  }
};

/**
 * Fetches all channels from the repository.
 *
 * @returns {Promise<commonChannelResponse[]>} A promise that resolves to an array of channel objects.
 */
export const findAllChannels = async (): Promise<commonChannelResponse[]> => {
  const channels = await channelRepository.findAllChannels();

  return channels.map((channel) => {
    // Convert imageURL to Base64 before returning the channel object
    channel.community.imageURL = convertImageToBase64(channel.community.imageURL);

    return channel;
  });
};


/**
 * Finds a channel by its ID.
 *
 * @param {number} channelId - The ID of the channel to retrieve.
 * @returns {Promise<channelResponse>} A promise that resolves to the channel object.
 * @throws {AppError} If no channel is found or the community is not active.
 */
export const findChannelById = async (
  channelId: number
): Promise<channelResponse> => {
  const channel: {
    id: number;
    canAddComments: boolean;
    communityId: number;
    community: {
      name: string;
      privacy: boolean;
      active: boolean;
      imageURL: string;
    };
  } = await channelRepository.findChannelById(channelId);

  if (!channel || !channel.community.active) {
    throw new AppError('No channel found with that ID', 404);
  }
  channel.community.imageURL = convertImageToBase64(channel.community.imageURL);
  delete channel.community.active;
  return channel;
};

/**
 * Creates a new channel and adds the creator as an admin member.
 *
 * @param {Object} data - The data to create a new channel.
 * @param {string} data.name - The name of the channel.
 * @param {number} data.creatorId - The ID of the creator of the channel.
 * @param {boolean} [data.privacy] - The privacy setting of the channel (optional).
 * @param {boolean} [data.canAddComments] - Whether users can add comments in the channel (optional).
 * @param {string} [data.imageURL] - The image URL for the channel (optional).
 * @returns {Promise<{id: number; canAddComments: boolean; community: {name: string; privacy: boolean}}>} A promise that resolves to the created channel object.
 * @throws {AppError} If the data is invalid.
 */
export const createChannel = async (data: {
  name: string;
  privacy?: boolean;
  creatorId: number;
  canAddComments?: boolean;
  imageURL?: string;
}): Promise<{
  id: number;
  canAddComments: boolean;
  community: { name: string; privacy: boolean };
}> => {
  checkData(data);

  const invitationLink: string = generateInvitationLink();

  if (data.imageURL) {
    const image = convertBase64ToImage(data.imageURL);
    data.imageURL = saveImage(image);
  }

  const channel: {
    id: number;
    canAddComments: boolean;
    community: { name: string; privacy: boolean; imageURL: string };
  } = await channelRepository.createChannel({
    ...data,
    invitationLink,
  });

  if (channel.community.imageURL)
    channel.community.imageURL = convertImageToBase64(
      channel.community.imageURL
    );

  await channelMemberService.addChannelMember(
    data.creatorId,
    channel.id,
    null,
    CommunityRole.admin,
    true
  );

  return channel;
};

/**
 * Updates a channel's details and its associated community.
 *
 * @param {number} channelId - The ID of the channel to update.
 * @param {number} adminId - The ID of the admin making the update request.
 * @param {Object} data - The data to update the channel with.
 * @param {string} [data.name] - The new name of the channel (optional).
 * @param {boolean} [data.privacy] - The new privacy setting of the channel (optional).
 * @param {boolean} [data.canAddComments] - Whether users can add comments in the channel (optional).
 * @param {string} [data.imageURL] - The new image URL for the channel (optional).
 * @returns {Promise<commonChannelResponse>} A promise that resolves to the updated channel object.
 * @throws {AppError} If no data is provided to update or the user does not have permission.
 */
export const updateChannel = async (
  channelId: number,
  adminId: number,
  data: {
    name?: string;
    privacy?: boolean;
    canAddComments?: boolean;
    imageURL?: string;
  }
): Promise<commonChannelResponse> => {
  const channel: {
    communityId: number;
  } = await findChannelById(channelId);

  // check permissions
  await channelMemberService.checkChannelMemberPermission(adminId, channelId);

  if (!data.name && !data.privacy && !data.canAddComments && !data.imageURL) {
    throw new AppError('No data to update', 400);
  }

  if (data.name || data.privacy || data.imageURL) {
    if (data.imageURL) {
      const image = convertBase64ToImage(data.imageURL);
      data.imageURL = saveImage(image);
    }

    await communityRepository.updateCommunity(channel.communityId, {
      ...data,
    });
  }
  const updatedChannel = await channelRepository.updateChannel(
    channelId,
    data.canAddComments
  );

  if (updatedChannel.community.imageURL)
    updatedChannel.community.imageURL = convertImageToBase64(
      updatedChannel.community.imageURL
    );

  return updatedChannel;
};

/**
 * Deletes a channel by its ID and deactivates its associated community.
 *
 * @param {number} channelId - The ID of the channel to delete.
 * @param {number} adminId - The ID of the admin making the delete request.
 * @returns {Promise<null>} A promise that resolves once the channel has been deleted and the community deactivated.
 * @throws {AppError} If the user does not have permission to delete the channel.
 */
export const deleteChannel = async (
  channelId: number,
  adminId: number
): Promise<null> => {
  const channel: {
    communityId: number;
    community: { active: boolean };
  } | null = await findChannelById(channelId);

  // check permissions
  await channelMemberService.checkChannelMemberPermission(adminId, channelId);

  await communityRepository.updateCommunity(channel.communityId, {
    active: false,
  });
  return null;
};
