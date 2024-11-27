import prisma from '../prisma/client';
import { Users } from '@prisma/client';
import { array } from 'zod';

// should take Omit<Users, 'id'> as the parameter type
export const createUser = async (user: any): Promise<Users> => {
  return prisma.users.create({ data: user });
};

export const findUserByEmail = async (email: string): Promise<Users | null> => {
  return prisma.users.findUnique({ where: { email } });
};

export const findUserByUsername = async (
  username: string
): Promise<Users | null> => {
  return prisma.users.findUnique({ where: { username } });
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
      blockedUser: true,
    },
  });
};
