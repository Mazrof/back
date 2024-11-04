import prisma from '../prisma/client';
import { Users } from '@prisma/client';

// should take Omit<Users, 'id'> as the parameter type
export const createUser = async (user: any): Promise<Users> => {
  return await prisma.users.create({ data: user });
};

export const findUserByEmail = async (email: string): Promise<Users | null> => {
  return await prisma.users.findUnique({ where: { email } });
};

export const findUserByUsername = async (username: string): Promise<Users | null> => {
  return await prisma.users.findUnique({ where: { username } });
}
