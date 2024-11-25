import express from 'express';
import { getAllUsers, banUser } from '../controllers/adminController';

const router = express.Router();

// they should be only permission in users route
router.get('/', getAllUsers);                      // Fetch all users
router.patch('/:userId/ban', banUser);            // Ban a user by user ID

export default router;
