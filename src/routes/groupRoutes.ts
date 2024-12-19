import express from 'express';
import {
  createGroup,
  getGroup,
  deleteGroup,
  getAllGroups,
  updateGroup,
  applyContentFilter,
} from '../controllers/groupController';
import groupMemberRouter from './groupMemberRoutes';
import { inviteGroupMember } from '../controllers/groupMemberController';

const router = express.Router({
  mergeParams: true,
});

/**
 * Routes for managing groups.
 */

/**
 * @route GET /
 * @description Fetch all groups based on privacy settings.
 * @access Restricted (requires authentication)
 *
 * @route POST /
 * @description Create a new group.
 * @access Restricted (requires authentication)
 */
router
  .route('/')
  .get(getAllGroups)
  .post(createGroup);

/**
 * @route POST /invitation
 * @description Invite a member to join a group.
 * @access Restricted (Admins or group owners only)
 */
router.route('/invitation').post(inviteGroupMember);

/**
 * Use groupMemberRouter for routes related to group members.
 */
router.use('/:groupId/members', groupMemberRouter);

/**
 * Routes for a specific group identified by its ID.
 *
 * @route GET /:id
 * @description Fetch a group based on privacy settings and membership.
 * @access Restricted (Admins or members only)
 *
 * @route PATCH /:id
 * @description Update a group's details (Admins only).
 * @access Restricted (Admins only)
 *
 * @route DELETE /:id
 * @description Delete a group (Admins only).
 * @access Restricted (Admins only)
 */
router
  .route('/:id')
  .get(getGroup)
  .patch(updateGroup)
  .delete(deleteGroup);

export default router;
