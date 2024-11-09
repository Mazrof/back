import * as userRepository from '../repositories/adminRepository';
import { AppError } from '../utility';

// Fetch all users
export const getAllUsers = async (adminId: number) => {
  const admin = await userRepository.findAdminById(adminId);

  if (!admin) {
    throw new AppError('Not Authorized', 403);
  }

  const users = await userRepository.getAllUsers();
  if (!users) {
    throw new AppError('No users found', 404);
  }
  return users;
};

// Ban or deactivate a user
export const toggleUserStatus = async (userId: number, adminId: number) => {
  const admin = await userRepository.findAdminById(adminId);

  if (!admin) {
    throw new AppError('Not Authorized', 403);
  }

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  const updatedUser = await userRepository.updateUserStatus(
    userId,
    !user.status
  );

  return updatedUser;
};
