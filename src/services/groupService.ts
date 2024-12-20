import * as groupRepository from '../repositories';
import * as groupMemberService from '../services/groupMemberService';
import { CommunityRole } from '@prisma/client';
import { checkAdmin } from '../services/adminService';
import { AppError } from '../utility';
import generateInvitationLink from '../utility/invitationLink';
import {
  getFileFromFirebase,
  uploadFileToFirebase,
} from '../third_party_services';


/**
 * Fetch all groups with community details and filter status.
 *
 * @returns {Promise<GroupResponse[]>}
 * An array of groups containing:
 * - `id`: Group ID
 * - `groupSize`: Size of the group
 * - `community`: Details of the community associated with the group, including:
 *   - `name`: Community name
 *   - `privacy`: Privacy setting
 *   - `imageURL`: Image URL of the community
 * - `hasFilter`: Whether the group has an admin filter applied
 */
export const findAllGroups = async (): Promise<
  {
    hasFilter: boolean;
    id: number;
    groupSize: number;
    community: { name: string; privacy: boolean; imageURL: string };
  }[]
> => {
  const groups = await groupRepository.findAllGroups();
  return groups.map((group) => ({
    id: group.id,
    groupSize: group.groupSize,
    community: group.community,
    hasFilter: group.adminGroupFilters?.groupId === group.id,
  }));
};

/**
 * Fetch a group by its ID.
 *
 * @param {number} id - The ID of the group to retrieve.
 * @returns {Promise<GroupResponse>}
 * A group object containing:
 * - `id`: Group ID
 * - `communityId`: ID of the associated community
 * - `community`: Details of the community, including:
 *   - `name`: Community name
 *   - `privacy`: Privacy setting (nullable)
 *   - `imageURL`: Image URL of the community
 * - `groupSize`: Size of the group (nullable)
 * @throws {AppError} If the group or community is inactive or not found.
 */
export const findGroupById = async (
  id: number
): Promise<{
  id: number;
  communityId: number;
  community: { name: string; privacy: boolean | null; imageURL: string };
  groupSize: number | null;
}> => {
  const group = await groupRepository.findGroupById(id);

  if (!group || !group.community.active) {
    throw new AppError('No Group found with that ID', 404);
  }
  group.hasFilter = group.adminGroupFilters?.groupId === group.id;
  delete group.community.active;
  delete group.adminGroupFilters;
  return group;
};

/**
 * Create a new group with associated community.
 *
 * @param {Object} data - Group creation data.
 * @param {string} data.name - Name of the community.
 * @param {boolean} data.privacy - Privacy setting of the community.
 * @param {number} data.creatorId - ID of the creator.
 * @param {number} data.groupSize - Size of the group.
 * @param {string} [data.imageURL] - Image URL for the community (optional).
 * @returns {Promise<GroupResponse>}
 * The created group object containing:
 * - `id`: Group ID
 * - `community`: Community details, including:
 *   - `name`: Community name
 *   - `privacy`: Privacy setting
 *   - `imageURL`: Image URL of the community
 * - `groupSize`: Size of the group
 * @throws {AppError} If required data is invalid.
 */
export const createGroup = async (data: {
  name: string;
  privacy: boolean;
  creatorId: number;
  groupSize: number;
  imageURL?: string;
}): Promise<{
  id: number;
  community: { name: string; privacy: boolean; imageURL: string };
  groupSize: number;
}> => {
  
  let message = '';
  if (!data.name) message = 'Invalid Group name';
  if (!data.creatorId)
    message += message ? ', Invalid Creator ID' : 'Invalid Creator ID';
  if (!data.groupSize || data.groupSize < 1)
    message += message ? ', Invalid Group size' : 'Invalid Group size';
  if (message) throw new AppError(message, 400);
  
  const tempURL = data.imageURL;
  if (data.imageURL) {
    try {
      data.imageURL = await uploadFileToFirebase(data.imageURL);
    } catch (error) {
      console.log('Error fetching image from Firebase:');
      data.imageURL = tempURL; 
    }
    data.imageURL = await uploadFileToFirebase(data.imageURL);
  }

  const invitationLink = generateInvitationLink();
  const group = await groupRepository.createGroup({ ...data, invitationLink });

  if (group.community.imageURL) {
    try {
      group.community.imageURL = await getFileFromFirebase(
        group.community.imageURL
      );
    } catch (error) {
      console.log('Error fetching image from Firebase:');
      group.community.imageURL = tempURL;
    }
  }

  await groupMemberService.addGroupCreator(
    group.id,
    data.creatorId,
    CommunityRole.admin
  );

  return group;
};

/**
 * Update a group's details.
 *
 * @param {number} groupId - The ID of the group to update.
 * @param {number} adminId - The ID of the admin performing the update.
 * @param {Object} data - Update data.
 * @param {string} [data.name] - Updated group name (optional).
 * @param {boolean} [data.privacy] - Updated privacy setting (optional).
 * @param {number} [data.groupSize] - Updated group size (optional).
 * @param {string} [data.imageURL] - Updated image URL (optional).
 * @returns {Promise<GroupResponse>}
 * The updated group object.
 * @throws {AppError} If the admin lacks permissions or data is invalid.
 */
export const updateGroup = async (
  groupId: number,
  adminId: number,
  data: {
    name?: string;
    privacy?: boolean;
    groupSize?: number;
    imageURL?: string;
  }
): Promise<{
  id: number;
  community: { name: string; privacy: boolean; imageURL: string };
  groupSize: number;
}> => {
  const group = await findGroupById(groupId);

  await groupMemberService.checkGroupMemberPermission(adminId, groupId);

  if (!data.name && !data.privacy && !data.groupSize && !data.imageURL) {
    throw new AppError('No data to update', 400);
  }
  const tempURL = data.imageURL;
  if (data.name || data.privacy || data.imageURL) {
    if (data.imageURL) {
      try {
        data.imageURL = await uploadFileToFirebase(data.imageURL);
      } catch (error) {
        console.log("Error fetching image from Firebase:", );
        data.imageURL = tempURL;
      }
    }
    await groupRepository.updateCommunity(group.communityId, data);
  }

  const count = await groupRepository.getGroupSize(groupId);
  if (data.groupSize && data.groupSize < count) {
    throw new AppError('Invalid Group Size Limit', 400);
  }
  if (data.groupSize < 1) throw new AppError('Invalid Group Size Limit', 400);

  const updatedGroup = await groupRepository.updateGroup(
    groupId,
    data.groupSize
  );

  if (updatedGroup.community.imageURL) {
    try {
      updatedGroup.community.imageURL = await getFileFromFirebase(updatedGroup.community.imageURL);
    } catch (error) {
      console.error("Error fetching image from Firebase:", error);
      // Optionally, you can set the imageURL to null or handle the error differently.
      updatedGroup.community.imageURL = tempURL; // or keep it unchanged if you prefer
    }
  }

  return updatedGroup;
};

/**
 * Delete a group.
 *
 * @param {number} groupId - The ID of the group to delete.
 * @param {number} adminId - The ID of the admin performing the deletion.
 * @returns {Promise<null>}
 * @throws {AppError} If the admin lacks permissions.
 */
export const deleteGroup = async (
  groupId: number,
  adminId: number
): Promise<null> => {
  const group = await findGroupById(groupId);

  await groupMemberService.checkGroupMemberPermission(adminId, groupId);

  await groupRepository.updateCommunity(group.communityId, {
    active: false,
  });
  return null;
};

/**
 * Apply or remove a group filter for admins.
 *
 * @param {number} groupId - The ID of the group.
 * @param {number} adminId - The ID of the admin applying/removing the filter.
 * @returns {Promise<{ adminId: number; groupId: number } | null>}
 * The group filter object if applied, otherwise null.
 * @throws {AppError} If the admin lacks permissions.
 */
export const applyGroupFilter = async (
  groupId: number,
  adminId: number
): Promise<{
  adminId: number;
  groupId: number;
} | null> => {
  await checkAdmin(adminId);

  const group = await findGroupById(groupId);

  const groupFilter = await groupRepository.findGroupFilter(groupId, adminId);

  if (groupFilter) {
    return await groupRepository.deleteGroupFilter(groupId, adminId);
  }

  return await groupRepository.createGroupFilter(groupId, adminId);
};
