/**
 * Import the user repository and application error handling utility.
 */
import * as userRepository from '../repositories';
import { AppError } from '../utility';

/**
 * Checks whether an admin with the given ID exists.
 * Throws an error if the admin is not found.
 *
 * @param {number} adminId - The ID of the admin to verify.
 * @throws {AppError} If the admin is not found.
 */
export const checkAdmin = async (adminId: number): Promise<void> => {
  const admin: { id: number } | null =
    await userRepository.findAdminById(adminId);

  if (!admin) {
    throw new AppError('Not Authorized', 403);
  }
};

/**
 * Fetches all users from the database.
 * Requires the requester to be an authorized admin.
 *
 * @param {number} adminId - The ID of the admin making the request.
 * @returns {Promise<Array<{id: number, username: string, email: string, phone: string, bio: string, status: boolean, activeNow: boolean}>>}
 * An array of user objects containing:
 *  - `id`: User ID
 *  - `username`: User's username
 *  - `email`: User's email
 *  - `phone`: User's phone number
 *  - `bio`: User's bio
 *  - `status`: User's account status
 *  - `activeNow`: User's online status
 * @throws {AppError} If the admin is not authorized or no users are found.
 */
export const getAllUsers = async (
  adminId: number
): Promise<
  {
    id: number;
    username: string;
    email: string;
    phone: string;
    bio: string;
    status: boolean;
    activeNow: boolean;
  }[]
> => {
  // Verify admin authorization
  await checkAdmin(adminId);

  const users = await userRepository.getAllUsers();

  if (!users) {
    throw new AppError('No users found', 404);
  }

  return users;
};

/**
 * Toggles the active status of a user.
 * Requires the requester to be an authorized admin.
 *
 * @param {number} userId - The ID of the user to toggle status for.
 * @param {number} adminId - The ID of the admin making the request.
 * @returns {Promise<{id: number, username: string, status: boolean | null} | null>}
 * The updated user object containing:
 *  - `id`: User ID
 *  - `username`: User's username
 *  - `status`: User's updated account status
 * Returns `null` if no user is found.
 * @throws {AppError} If the admin is not authorized or the user is not found.
 */
export const toggleUserStatus = async (
  userId: number,
  adminId: number
): Promise<{
  id: number;
  username: string;
  status: boolean | null;
} | null> => {
  // Verify admin authorization
  await checkAdmin(adminId);

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  return await userRepository.updateUserStatus(userId, !user.status);
};
