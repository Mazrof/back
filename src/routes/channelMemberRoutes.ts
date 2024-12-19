import express from 'express';
import {
  addChannelMember,
  deleteChannelMember,
  getChannelMembers,
  updateChannelMember,
} from '../controllers/channelMemberController';

const router = express.Router({
  mergeParams: true,
});

/**
 * Routes for managing channel members.
 */

/**
 * @route GET /
 * @description Fetch all members of a channel.
 * @access Public (Anyone can access)
 *
 * @route POST /
 * @description Add a new member to a channel.
 * @access Restricted (Based on permissions)
 */
router.route('/').get(getChannelMembers).post(addChannelMember);

/**
 * Routes for a specific channel member identified by their ID.
 *
 * @route PATCH /:id
 * @description Update details of a channel member.
 * @access Restricted (Admins only, with permissions for roles, messaging, downloading)
 *
 * @route DELETE /:id
 * @description Remove a member from a channel.
 * @access Restricted (Based on permissions or for the user itself)
 */
router.route('/:id').patch(updateChannelMember).delete(deleteChannelMember);

export default router;
