import express, { Router } from 'express';
import {
  addGroupMember,
  deleteGroupMember,
  getGroupMembers,
  updateGroupMember,
} from '../controllers/groupMemberController';

const router: Router = express.Router({
  mergeParams: true,
});

/**
 * Routes for managing group members.
 */

/**
 * @route GET /
 * @description Fetch all members of a group.
 * @access Public (Anyone can access)
 *
 * @route POST /
 * @description Add a new member to a group.
 * @access Restricted (Based on permissions)
 */
router.route('/').get(getGroupMembers).post(addGroupMember);

/**
 * Routes for a specific group member identified by their ID.
 *
 * @route PATCH /:id
 * @description Update details of a group member.
 * @access Restricted (Admins only, with permissions for roles, messaging, downloading)
 *
 * @route DELETE /:id
 * @description Remove a member from a group.
 * @access Restricted (Based on permissions or for the user itself)
 */
router.route('/:id').patch(updateGroupMember).delete(deleteGroupMember);

export default router;
