// src/repository/profileRepository.ts
import { prisma } from '../prisma/client';

export const findAllProfiles = async () => {
  return prisma.users.findMany();
};

export const findProfileById = async (id: number) => {
  return prisma.users.findUnique({
    where: { id },
    select: {
      username: true,
      password: true,
      email: true,
      photo: true,
      phone: true,
      bio: true,
      screenName: true,
      autoDownloadSizeLimit: true,
      maxLimitFileSize: true,
      profilePicVisibility: true,
      storyVisibility: true,
      readReceiptsEnabled: true,
      lastSeenVisibility: true,
      groupAddPermission: true,
    },
  });
};

export const createProfile = async (data: any) => {
  return prisma.users.create({
    data,
  });
};

export const updateProfileById = async (id: number, data: any) => {
  return prisma.users.update({
    where: { id },
    data,
  });
};
