import express, { Router } from 'express';
import {
  createChannel,
  getChannel,
  deleteChannel,
  getAllChannels,
  updateChannel,
  inviteChannelMember,
} from '../controllers';
import channelMemberRouter from './channelMemberRoutes';

const router: Router = express.Router({
  mergeParams: true,
});

/**
 * Routes for managing channels.
 */

/**
 * @route GET /
 * @description Fetch all channels based on privacy settings.
 * @access Restricted (requires authentication)
 *
 * @route POST /
 * @description Create a new channel.
 * @access Restricted (requires authentication)
 */
router.route('/').get(getAllChannels).post(createChannel);

/**
 * @route POST /invitation
 * @description Invite a member to a channel.
 * @access Restricted (Admins of channel only)
 */
router.route('/invitation').post(inviteChannelMember);

/**
 * Use channelMemberRouter for routes related to channel members.
 */
router.use('/:channelId/members', channelMemberRouter);

/**
 * Routes for a specific channel identified by its ID.
 *
 * @route GET /:id
 * @description Fetch a channel based on privacy settings and membership.
 * @access Restricted (Admins or members only)
 *
 * @route PATCH /:id
 * @description Update a channel's details (Admins only).
 * @access Restricted (Admins only)
 *
 * @route DELETE /:id
 * @description Delete a channel (Admins only).
 * @access Restricted (Admins only)
 */
router.route('/:id').get(getChannel).patch(updateChannel).delete(deleteChannel);

export default router;
