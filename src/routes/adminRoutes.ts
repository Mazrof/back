import express from 'express';
import { getAllUsers, banUser } from '../controllers/adminController';
import { applyContentFilter } from '../controllers/groupController';

const router = express.Router();
// they should be only permission in users route
router.get('/users', getAllUsers); // Fetch all users
router.patch('/:userId', banUser); // Ban a user by user ID
router.post('/:groupId', applyContentFilter);
export default router;
