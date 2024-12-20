import prisma from '../prisma/client';

/**
 * Update the details of a community.
 *
 * @param {number} communityId - The ID of the community to update.
 * @param {Object} data - The data to update the community with.
 * @param {string} [data.name] - The new name of the community (optional).
 * @param {boolean} [data.privacy] - The new privacy setting of the community (optional).
 * @param {string} [data.imageURL] - The new image URL for the community (optional).
 * @param {boolean} [data.active] - The new active status of the community (optional).
 * @returns {Promise<void>}
 * No return value, but the community will be updated in the database.
 */
export const updateCommunity = async (
  communityId: number,
  data: {
    name?: string;
    privacy?: boolean;
    imageURL?: string;
    active?: boolean;
  }
): Promise<void> => {
  await prisma.communities.update({
    where: { id: communityId },
    data: {
      name: data.name,
      privacy: data.privacy,
      imageURL: data.imageURL,
      active: data.active,
    },
  });
};
