import prisma from '../prisma/client';
import { Users } from '@prisma/client';
import { OAuthUser } from './repositoriesTypes/authTypes';
import { Social } from "@prisma/client";
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
export const storeOAuthUser = async (user: OAuthUser): Promise<Users|null> => {
  let existingUser = await prisma.users.findFirst({
    where: {
      providerId: user.providerId,
      providerType: Social[user.provider as keyof typeof Social],
    },
  });
  if (existingUser) {
    console.log("USER ALREADY EXISTS")
    return existingUser;
  }
  const providerType = Social[user.provider as keyof typeof Social];
  if (!providerType) {
    throw new Error(`Invalid providerType: ${user.provider}`)
  }
  const newUser = await prisma.users.create({
    data: {
      email: user.email as string || '',
      username: user.userName,
      password: '',
      providerType,
      providerId: user.providerId,
      photo: user.picture,
      IsEmailVerified: user.email_verified,
      public_key:""

    },
  });
  console.log("USER CREATED")
  return newUser;
};
