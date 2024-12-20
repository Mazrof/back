import { prisma } from '../prisma/client';
import {
  channelResponse,
  commonChannelResponse,
  selectType,
} from './repositoriesTypes/channelTypes';

/**
 * The `selectObject` is used to specify the fields to be selected when querying channels and communities.
 */
const selectObject: selectType = {
  id: true,
  communityId: true,
  canAddComments: true,
  invitationLink: true,
  community: {
    select: {
      name: true,
      privacy: true,
      imageURL: true,
      active: true,
    },
  },
};

const selectAllObject = {
  id: true,
  communityId: true,
  canAddComments: true,
  invitationLink: true,
  community: {
    select: {
      name: true,
      privacy: true,
      imageURL: true,
    },
  },
};
/**
 * Fetch all active channels from the database.
 *
 * @returns {Promise<commonChannelResponse[]>}
 * An array of channel objects, each containing:
 *  - `id`: Channel ID
 *  - `communityId`: Community ID associated with the channel
 *  - `canAddComments`: Whether users can add comments in the channel
 *  - `invitationLink`: The invitation link for the channel
 *  - `community`: The community associated with the channel, including:
 *    - `name`: Community name
 *    - `privacy`: Community privacy setting
 *    - `imageURL`: Community image URL
 *    - `active`: Whether the community is active
 */
export const findAllChannels = async (): Promise<commonChannelResponse[]> => {
  return prisma.channels.findMany({
    where: {
      community: {
        active: true,
      },
    },
    select: selectAllObject,
  });
};

/**
 * Find a channel by its ID.
 *
 * @param {number} id - The ID of the channel to retrieve.
 * @returns {Promise<channelResponse>}
 * A channel object containing:
 *  - `id`: Channel ID
 *  - `communityId`: Community ID associated with the channel
 *  - `canAddComments`: Whether users can add comments in the channel
 *  - `invitationLink`: The invitation link for the channel
 *  - `community`: The community associated with the channel, including:
 *    - `name`: Community name
 *    - `privacy`: Community privacy setting
 *    - `imageURL`: Community image URL
 *    - `active`: Whether the community is active
 */
export const findChannelById = async (id: number): Promise<channelResponse> => {
  return prisma.channels.findUnique({
    where: {
      id,
    },
    select: selectObject,
  });
};

/**
 * Create a new channel with a community.
 *
 * @param {Object} data - The data to create a new channel.
 * @param {string} data.name - The name of the community.
 * @param {boolean} [data.privacy] - The privacy setting of the community (optional).
 * @param {number} data.creatorId - The ID of the creator of the community.
 * @param {boolean} [data.canAddComments] - Whether users can add comments in the channel (optional).
 * @param {string} data.invitationLink - The invitation link for the channel.
 * @param {string} [data.imageURL] - The image URL for the community (optional).
 * @returns {Promise<commonChannelResponse>}
 * A common channel response object containing the newly created channel and community details.
 */
export const createChannel = async (data: {
  name: string;
  privacy?: boolean;
  creatorId: number;
  canAddComments?: boolean;
  invitationLink: string;
  imageURL?: string;
}): Promise<commonChannelResponse> => {
  return prisma.channels.create({
    data: {
      canAddComments: data.canAddComments,
      invitationLink: data.invitationLink,
      community: {
        create: {
          name: data.name,
          privacy: data.privacy,
          creatorId: data.creatorId,
          imageURL: data.imageURL,
        },
      },
    },
    select: selectAllObject,
  });
};

/**
 * Update the channel's ability to add comments.
 *
 * @param {number} channelId - The ID of the channel to update.
 * @param {boolean} [canAddComments] - Whether users can add comments in the channel (optional).
 * @returns {Promise<commonChannelResponse>}
 * The updated channel object containing:
 *  - `id`: Channel ID
 *  - `communityId`: Community ID associated with the channel
 *  - `canAddComments`: Whether users can add comments in the channel
 *  - `invitationLink`: The invitation link for the channel
 *  - `community`: The community associated with the channel, including:
 *    - `name`: Community name
 *    - `privacy`: Community privacy setting
 *    - `imageURL`: Community image URL
 *    - `active`: Whether the community is active
 */
export const updateChannel = async (
  channelId: number,
  canAddComments?: boolean
): Promise<commonChannelResponse> => {
  return prisma.channels.update({
    where: { id: channelId },
    data: {
      canAddComments: canAddComments,
    },
    select: selectAllObject,
  });
};
