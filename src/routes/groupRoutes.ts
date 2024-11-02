import express, { Request, Response, NextFunction } from 'express';
import { createGroup, getGroup, deleteGroup, getAllGroups, updateGroup, applyContentFilter } from '../controllers/groupController';
import groupMembersRouter from './groupMemberRoutes';

const router = express.Router({
    mergeParams: true,
});

// Auth the user (add your authentication middleware here)

// Route to get all groups and to create a new group
router.route('/')
    .get(getAllGroups)   // Fetch all groups based on privacy
    .post(createGroup);   // Create a new group

// Use groupMembersRouter for routes related to group members
router.use('/:groupId/members', groupMembersRouter);

// Route to get, update, and delete a specific group by ID
router.route('/:id')
    .get(getGroup)        // Fetch a group based on privacy, and membership
    .patch(updateGroup)   // Update a group by Admins
    .delete(deleteGroup); // Delete a group by Admins

// App's admins only
router.post('/:groupId/filter', applyContentFilter);

export default router;
