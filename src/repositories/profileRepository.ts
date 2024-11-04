// src/repository/profileRepository.ts
import { prisma } from '../prisma/client';

export const findAllProfiles = async () => {
  return await prisma.users.findMany();
};

export const findProfileById = async (id: number) => {
  return await prisma.users.findUnique({
    where: { id },
  });
};

export const createProfile = async (data: any) => {
  return await prisma.users.create({
    data,
  });
};

export const updateProfileById = async (id: number, data: any) => {
  return await prisma.users.update({
    where: { id },
    data,
  });
};
