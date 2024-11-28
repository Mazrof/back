import * as userRepository from '../repositories/adminRepository';
import { AppError } from '../utility';

// Fetch all users
export const getAllUsers = async (
  adminId: number
): Promise<
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
  const admin: { id: number } | null =
    await userRepository.findAdminById(adminId);
  // check the authorization
  if (!admin) {
    throw new AppError('Not Authorized', 403);
  }

  const users: {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    bio: string | null;
    status: boolean | null;
    activeNow: boolean | null;
  }[] = await userRepository.getAllUsers();

  if (!users) {
    throw new AppError('No users found', 404);
  }

  return users;
};

// Ban or deactivate a user
export const toggleUserStatus = async (
  userId: number,
  adminId: number
): Promise<{
  id: number;
  username: string;
  status: boolean | null;
} | null> => {
  const admin: { id: number } | null =
    await userRepository.findAdminById(adminId);

  if (!admin) {
    throw new AppError('Not Authorized', 403);
  }

  const user: {
    id: number;
    username: string;
    status: boolean | null;
  } | null = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  const updatedUser: {
    id: number;
    username: string;
    status: boolean | null;
  } | null = await userRepository.updateUserStatus(userId, !user.status);

  return updatedUser;
};
