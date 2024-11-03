import express, { Request, Response, NextFunction } from 'express';
import {
  addChannelMember,
  deleteChannelMember,
  getChannelMembers,
  updateChannelMember,
} from '../controllers/channelMemberController';

const router = express.Router({
  mergeParams: true,
});

// Routes for channel members
router
  .route('')
  .get(getChannelMembers) // Anyone can access
  .post(addChannelMember)
  .delete(deleteChannelMember); // Based on permissions or the user itself

router.route('/:id').patch(updateChannelMember); // Admins only (role, messaging, downloading)
// .delete(deleteChannelMember); // Based on permissions or the user itself

export default router;
