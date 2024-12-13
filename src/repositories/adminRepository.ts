/**
 * Import the Prisma client instance for database interactions.
 */
import prisma from '../prisma/client';

/**
 * Fetch all users from the database with specific selected fields.
 *
 * @returns {Promise<Array<{id: number, username: string, email: string, phone: string , bio: string , status: boolean , activeNow: boolean}>>}
 * An array of user objects containing:
 *  - `id`: User ID
 *  - `username`: User's username
 *  - `email`: User's email
 *  - `phone`: User's phone number (nullable)
 *  - `bio`: User's bio (nullable)
 *  - `status`: User's account status (nullable)
 *  - `activeNow`: User's online status (nullable)
 */
export const getAllUsers = async (): Promise<
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
  return prisma.users.findMany({
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

/**
 * Find a user in the database by their ID.
 *
 * @param {number} id - The ID of the user to retrieve.
 * @returns {Promise<{id: number, username: string, status: boolean} | null>}
 * A user object with the following fields if found:
 *  - `id`: User ID
 *  - `username`: User's username
 *  - `status`: User's account status (nullable)
 * Returns `null` if no user is found.
 */
export const findUserById = async (
  id: number
): Promise<{
  id: number;
  username: string;
  status: boolean;
} | null> => {
  return prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      status: true,
    },
  });
};

/**
 * Find an admin in the database by their ID.
 *
 * @param {number} id - The ID of the admin to retrieve.
 * @returns {Promise<{id: number} | null>}
 * An admin object containing:
 *  - `id`: Admin ID
 * Returns `null` if no admin is found.
 */
export const findAdminById = async (
  id: number
): Promise<{ id: number } | null> => {
  return prisma.admins.findUnique({
    where: { id },
    select: {
      id: true,
    },
  });
};

/**
 * Update the status of a user in the database by their ID.
 *
 * @param {number} id - The ID of the user to update.
 * @param {boolean} status - The new status to set for the user.
 * @returns {Promise<{id: number, username: string, status: boolean } | null>}
 * The updated user object containing:
 *  - `id`: User ID
 *  - `username`: User's username
 *  - `status`: User's updated account status (nullable)
 * Returns `null` if no user is found.
 */
export const updateUserStatus = async (
  id: number,
  status: boolean
): Promise<{
  id: number;
  username: string;
  status: boolean;
} | null> => {
  return prisma.users.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      username: true,
      status: true,
    },
  });
};
