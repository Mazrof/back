/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../prisma/client';

import { Users, Admins } from '@prisma/client';
import { OAuthUser } from './repositoriesTypes/authTypes';
import { Social } from '@prisma/client';
import { AppError } from '../utility';

// should take Omit<Users, 'id'> as the parameter type
export const createUser = async (user: any): Promise<Users> => {
  return prisma.users.create({ data: user });
};

export const findUserByEmail = async (
  email: string
): Promise<Users | null | Admins> => {
  const normal_user = await prisma.users.findUnique({ where: { email } });
  if (normal_user) {
    return normal_user;
  }
  const admin_user = await prisma.admins.findUnique({
    where: { email },
    include: {
      bannedUsers: true,
    },
  });
  return admin_user;
};

export const findUserByUsername = async (
  username: string
): Promise<Users | null> => {
  return await prisma.users.findUnique({ where: { username } });
};

export const findUserByProvider = async (
  providerId: string,
  providerType: Social
): Promise<Users | null> => {
  return await prisma.users.findFirst({ where: { providerId, providerType } });
};

export const findUserById = async (id: number): Promise<Users | null> => {
  return await prisma.users.findUnique({ where: { id } });
};

export const updateUserById = async (
  id: number,
  data: Partial<Users>
): Promise<Users> => {
  return await prisma.users.update({ where: { id }, data });
};

export const storeOAuthUser = async (user: OAuthUser): Promise<Users> => {
  const providerType = Social[user.provider as keyof typeof Social];
  if (!providerType) {
    throw new AppError('Invalid provider', 400);
  }
  const newUser = await prisma.users.create({
    data: {
      email: (user.email as string) || '',
      username: user.userName,
      password: '',
      providerType,
      providerId: user.providerId,
      photo: user.picture,
      isEmailVerified: user.email_verified,
      publicKey: '',
    },
  });
  console.log('USER CREATED');
  return newUser;
};
export const AddUserToBlocked = async (
  blockerId: number,
  blockedId: number
) => {
  return prisma.userBlacklist.create({
    data: {
      blockerId: blockerId,
      blockedId: blockedId,
    },
  });
};

export const RemoveUserFromBlocked = async (
  blockerId: number,
  blockedId: number
) => {
  return prisma.userBlacklist.delete({
    where: {
      blockerId_blockedId: {
        blockerId: blockerId,
        blockedId: blockedId,
      },
    },
  });
};

export const GetUserBlockedList = async (blockerId: number) => {
  return prisma.userBlacklist.findMany({
    where: {
      blockerId: blockerId,
    },
    include: {
      blockedUser: {
        select: {
          id: true,
          username: true,
          photo: true,
          profilePicVisibility: true,
        },
      },
    },
  });
};
