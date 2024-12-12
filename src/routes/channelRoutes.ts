import express, { Request, Response, NextFunction } from 'express';
import {
  createChannel,
  getChannel,
  deleteChannel,
  getAllChannels,
  updateChannel,
} from '../controllers/channelController';
import channelMemberRouter from './channelMemberRoutes';
import { inviteChannelMember } from '../controllers/channelMemberController';

const router = express.Router({
  mergeParams: true,
});

// Auth the user (add your authentication middleware here)

// Route to get all Channels and to create a new Channel
router
  .route('/')
  .get(getAllChannels) // Fetch all Channels based on privacy
  .post(createChannel); // Create a new Channel

router.route('/invitation').post(inviteChannelMember);

// Use ChannelMembersRouter for routes related to Channel members
router.use('/:channelId/members', channelMemberRouter);

// Route to get, update, and delete a specific Channel by ID
router
  .route('/:id')
  .get(getChannel) // Fetch a Channel based on privacy, and membership
  .patch(updateChannel) // Update a Channel by Admins
  .delete(deleteChannel); // Delete a Channel by Admins

export default router;
