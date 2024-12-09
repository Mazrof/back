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

// Auth the user (add your authentication middleware here)

// Route to get all groups and to create a new group
router
  .route('/')
  .get(getAllGroups) // Fetch all groups based on privacy
  .post(createGroup); // Create a new group
router.route('/invitation').post(inviteGroupMember);
// Use groupMembersRouter for routes related to group members
router.use('/:groupId/members', groupMemberRouter);

// Route to get, update, and delete a specific group by ID
router
  .route('/:id')
  .get(getGroup) // Fetch a group based on privacy, and membership
  .patch(updateGroup) // Update a group by Admins
  .delete(deleteGroup); // Delete a group by Admins

export default router;
