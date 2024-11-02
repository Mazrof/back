import * as groupMembershipRepository from '../repositories/groupMemberRepository';
import { AppError } from '../utility';
import { UpdateGroupMemberData } from '../types';

export const getGroupMembers = async (groupId: number) => {
  return await groupMembershipRepository.findGroupMembers(groupId);
};

export const addGroupMember = async (
  userId: number,
  groupId: number,
  memberId: number
) => {
  // Check if the user is an admin in the group
  const user = await groupMembershipRepository.findGroupMembership(
    userId,
    groupId
  );
  if (!user || user.role !== 'Admin') {
    throw new AppError('Not Authorized', 403);
  }

  // Check if the member already exists in the group
  const existingMember = await groupMembershipRepository.findExistingMember(
    memberId,
    groupId
  );
  if (existingMember) {
    if (!existingMember.status) {
      return await groupMembershipRepository.updateGroupMembershipStatus(
        memberId,
        groupId,
        true
      );
    }
    throw new AppError('Member already exists in this group', 404);
  }

  // Create a new group membership for the member
  return await groupMembershipRepository.createGroupMembership({
    groupId,
    userId: memberId,
  });
};

export const updateGroupMember = async (
  userId: number,
  groupId: number,
  memberId: number,
  updates: UpdateGroupMemberData
) => {
  const user = await groupMembershipRepository.findGroupMembership(
    userId,
    groupId
  );
  if (!user || user.role !== 'Admin') {
    throw new AppError('Not Authorized', 403);
  }

  const existingMember = await groupMembershipRepository.findExistingMember(
    memberId,
    groupId
  );
  if (!existingMember) {
    throw new AppError('Member not found in this group', 404);
  }

  const updatedData: UpdateGroupMemberData = {};
  if (updates.role) {
    updatedData.role = updates.role;
  }
  if (updates.hasMessagePermissions) {
    updatedData.hasMessagePermissions = updates.hasMessagePermissions;
  }
  if (updates.hasDownloadPermissions) {
    updatedData.hasDownloadPermissions = updates.hasDownloadPermissions;
  }

  return await groupMembershipRepository.updateGroupMembershipData(
    memberId,
    groupId,
    updatedData
  );
};

export const deleteGroupMember = async (
  userId: number,
  groupId: number,
  memberId: number
) => {
  const existingMember = await groupMembershipRepository.findExistingMember(
    memberId,
    groupId
  );
  if (!existingMember) {
    throw new AppError('Member not found in this group', 404);
  }

  if (userId !== memberId) {
    const user = await groupMembershipRepository.findGroupMembership(
      userId,
      groupId
    );
    if (!user || user.role !== 'Admin') {
      throw new AppError('Not Authorized', 403);
    }
  }

  return await groupMembershipRepository.updateGroupMembershipStatus(
    memberId,
    groupId,
    false
  );
};

// import prisma from '../prisma/client';
// import { AppError } from '../utility';
//
// interface UpdateGroupMemberData {
//   role?: string;
//   hasMessagePermissions?: boolean;
//   hasDownloadPermissions?: boolean;
// }
//
// export const getGroupMembers = async (groupId: number) => {
//   const members = await prisma.groupMemberships.findMany({
//     where: {
//       groupId,
//       status: true,
//     },
//     select: {
//       groupId: true,
//       userId: true,
//       role: true,
//       status: true,
//       hasDownloadPermissions: true,
//       hasMessagePermissions: true,
//       users: {
//         select: {
//           username: true,
//         },
//       },
//     },
//   });
//
//   return members;
// };
//
// export const addGroupMember = async (
//   userId: number,
//   groupId: number,
//   memberId: number
// ) => {
//   // Check if the user is an admin in the group
//   const user = await prisma.groupMemberships.findFirst({
//     where: {
//       userId,
//       groupId,
//       status: true,
//     },
//     select: {
//       role: true,
//     },
//   });
//
//   if (!user || user.role !== 'Admin') {
//     throw new AppError('Not Authorized', 403);
//   }
//
//   // Check if the member already exists in the group
//   const existingMember = await prisma.groupMemberships.findFirst({
//     where: {
//       AND: [{ userId: memberId }, { groupId }],
//     },
//     select: {
//       role: true,
//       hasMessagePermissions: true,
//       hasDownloadPermissions: true,
//       status: true,
//     },
//   });
//
//   // If member exists but is inactive, reactivate them
//   if (existingMember && !existingMember.status) {
//     return await prisma.groupMemberships.update({
//       where: {
//         userId_groupId: {
//           userId: memberId,
//           groupId,
//         },
//       },
//       data: {
//         status: true,
//       },
//     });
//   }
//
//   // If the member already exists and is active, throw an error
//   if (existingMember && existingMember.status) {
//     throw new AppError('Member already exists in this group', 404);
//   }
//
//   // Create a new group membership for the member
//   const memberData = { groupId, userId: memberId };
//   return await prisma.groupMemberships.create({ data: memberData });
// };
//
// export const updateGroupMember = async (
//   userId: number,
//   groupId: number,
//   memberId: number,
//   updates: UpdateGroupMemberData
// ) => {
//   const user = await prisma.groupMemberships.findFirst({
//     where: {
//       userId,
//       groupId,
//       status: true,
//     },
//     select: {
//       role: true,
//     },
//   });
//
//   if (!user || user.role !== 'Admin') {
//     throw new AppError('Not Authorized', 403);
//   }
//
//   const existingMember = await prisma.groupMemberships.findFirst({
//     where: {
//       userId: memberId,
//       groupId,
//       status: true,
//     },
//     select: {
//       role: true,
//       hasMessagePermissions: true,
//       hasDownloadPermissions: true,
//     },
//   });
//
//   if (!existingMember) {
//     throw new AppError('Member not found in this group', 404);
//   }
//
//   const updatedData = existingMember;
//   if (updates.role) {
//     updatedData.role = updates.role;
//   }
//   if (updates.hasMessagePermissions) {
//     updatedData.hasMessagePermissions = updates.hasMessagePermissions;
//   }
//   if (updates.hasDownloadPermissions) {
//     updatedData.hasDownloadPermissions = updates.hasDownloadPermissions;
//   }
//
//   const member = await prisma.groupMemberships.update({
//     where: {
//       userId_groupId: {
//         userId: memberId,
//         groupId: groupId,
//       },
//     },
//     data: updatedData,
//   });
//
//   return member;
// };
//
// export const deleteGroupMember = async (
//   userId: number,
//   groupId: number,
//   memberId: number
// ) => {
//   const existingMember = await prisma.groupMemberships.findFirst({
//     where: {
//       userId: memberId,
//       groupId,
//       status: true,
//     },
//     select: {
//       role: true,
//     },
//   });
//
//   if (!existingMember) {
//     throw new AppError('Member not found in this group', 404);
//   }
//
//   if (userId !== memberId) {
//     const user = await prisma.groupMemberships.findFirst({
//       where: {
//         userId,
//         groupId,
//         status: true,
//       },
//       select: {
//         role: true,
//       },
//     });
//
//     if (!user || user.role !== 'Admin') {
//       throw new AppError('Not Authorized', 403);
//     }
//   }
//
//   return await prisma.groupMemberships.update({
//     where: {
//       userId_groupId: {
//         userId: memberId,
//         groupId,
//       },
//     },
//     data: {
//       status: false,
//     },
//   });
// };
