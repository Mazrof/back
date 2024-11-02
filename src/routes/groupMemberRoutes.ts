import express, { Request, Response, NextFunction } from 'express';
import { addGroupMember, deleteGroupMember, getGroupMembers, updateGroupMember } from '../controllers/groupMemberController';

const router = express.Router({
    mergeParams: true,
});

// Routes for group members
router.route('')
    .get(getGroupMembers)   // Anyone can access
    .post(addGroupMember);   // Based on permissions

router.route('/:id')
    .patch(updateGroupMember)  // Admins only (role, messaging, downloading)
    .delete(deleteGroupMember); // Based on permissions or the user itself

export default router;
