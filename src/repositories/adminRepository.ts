import prisma from '../prisma/client';

//Fetch all users with selected fields
export const getAllUsers = async (): Promise<
  {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    bio: string | null;
    status: boolean | null;
    activeNow: boolean | null;
  }[]
> => {
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
): Promise<{
  id: number;
  username: string;
  status: boolean | null;
} | null> => {
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
): Promise<{ id: number } | null> => {
  return await prisma.admins.findUnique({
    where: { id },
    select: {
      id: true,
    },
  });
};

// Update user status by ID
export const updateUserStatus = async (
  id: number,
  status: boolean
): Promise<{
  id: number;
  username: string;
  status: boolean | null;
} | null> => {
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
