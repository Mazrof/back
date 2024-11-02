import * as groupRepository from '../repositories/groupRepository';

export const findAllGroups = async () => {
  return await groupRepository.findAllGroups();
};

export const findGroupById = async (id: number) => {
  return await groupRepository.findGroupById(id);
};

export const createGroup = async (data: {
  name: string;
  privacy: boolean;
  creatorId: number;
  groupSize: number;
}) => {
  return await groupRepository.createGroup(data);
};

export const updateGroup = async (
  groupId: number,
  data: { name?: string; privacy?: boolean; groupSize?: number }
) => {
  return await groupRepository.updateGroup(groupId, data);
};

export const deleteGroup = async (id: number) => {
  return await groupRepository.deleteGroup(id);
};

// import { prisma } from '../prisma/client';
// import { AppError } from '../utility';
//
// export const findAllGroups = async () => {
//   const groups = await prisma.groups.findMany({
//     where: { status: true },
//     select: {
//       id: true,
//       groupSize: true,
//       communities: {
//         select: {
//           name: true,
//           privacy: true,
//         },
//       },
//     },
//   });
//
//   return groups;
// };
//
// export const findGroupById = async (id: number) => {
//   const group = await prisma.groups.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       groupSize: true,
//       communities: {
//         select: {
//           name: true,
//           privacy: true,
//         },
//       },
//     },
//   });
//
//   if (!group) {
//     throw new AppError('No Group found with that ID', 404);
//   }
//
//   return group;
// };
//
// export const createGroup = async (data: {
//   name: string;
//   privacy: boolean;
//   creatorId: number;
//   groupSize: number;
// }) => {
//   const community = await prisma.communities.create({
//     data: {
//       name: data.name,
//       privacy: data.privacy,
//       creatorId: data.creatorId,
//     },
//   });
//
//   const group = await prisma.groups.create({
//     data: {
//       groupSize: data.groupSize,
//       status: true,
//       communityId: community.id,
//     },
//     select: {
//       id: true,
//       groupSize: true,
//       communities: {
//         select: {
//           name: true,
//           privacy: true,
//         },
//       },
//     },
//   });
//   return group;
// };
//
// export const updateGroup = async (
//   groupId: number,
//   data: { name?: string; privacy?: boolean; groupSize?: number }
// ) => {
//   let group;
//
//   group = await prisma.communities.findUnique({
//     where: { id: groupId },
//   });
//
//   if (!group) {
//     throw new AppError('No Group found with that ID', 404);
//   }
//
//   if (data.name || data.privacy) {
//     group = await prisma.communities.update({
//       where: { id: groupId },
//       data: {
//         name: data.name,
//         privacy: data.privacy,
//       },
//     });
//   }
//
//   if (data.groupSize !== undefined) {
//     group = await prisma.groups.update({
//       where: { id: groupId },
//       data: {
//         groupSize: data.groupSize,
//       },
//       select: {
//         id: true,
//         groupSize: true,
//         communities: {
//           select: {
//             name: true,
//             privacy: true,
//           },
//         },
//       },
//     });
//   }
//
//   return group;
// };
//
// export const deleteGroup = async (id: number) => {
//   let group;
//
//   group = await prisma.communities.findUnique({
//     where: { id },
//   });
//
//   if (!group) {
//     throw new AppError('No Group found with that ID', 404);
//   }
//
//   await prisma.groups.update({
//     where: { id, status: true },
//     data: { status: false },
//   });
//
//   return group;
// };
