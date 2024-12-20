/**
 * Import required modules and controllers.
 */
import express, { Router } from 'express';
import { getAllUsers, banUser, applyContentFilter } from '../controllers';

const router: Router = express.Router();

/**
 * Routes related to user management, restricted to authorized users only.
 */

/**
 * @route GET /users
 * @description Fetch all users from the system.
 * @access Restricted (Admin-only)
 */
router.get('/users', getAllUsers);

/**
 * @route PATCH /:userId
 * @description Ban or toggle the status of a user by their ID.
 * @access Restricted (Admin-only)
 */
router.patch('/:userId', banUser);

/**
 * Group-related routes.
 */

/**
 * @route POST /:groupId
 * @description Apply content filtering settings to a group by its ID.
 * @access Restricted (Admin-only)
 */
router.post('/:groupId', applyContentFilter);

/**
 * Export the configured router for use in the application.
 */
export default router;
