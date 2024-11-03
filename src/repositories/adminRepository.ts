import prisma from '../prisma/client';
import { Users } from '@prisma/client';

//Fetch all users with selected fields
export const getAllUsers = async (): Promise<Partial<Users>[]> => {
  return await prisma.users.findMany({
    select: {
      id: true,
      username: true,
      status: true,
      email: true,
      bio: true,
      activeNow: true,
      phone: true,
    },
  });
};

// Find user by ID
export const findUserById = async (
  id: number
): Promise<Partial<Users> | null> => {
  return await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      status: true,
    },
  });
};

// Find user by ID
export const findAdminById = async (
  id: number
): Promise<Partial<Users> | null> => {
  return await prisma.admins.findUnique({
    where: { id },
  });
};

// Update user status by ID
export const updateUserStatus = async (
  id: number,
  status: boolean
): Promise<Partial<Users>> => {
  return await prisma.users.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      username: true,
      status: true,
    },
  });
};
