import express from 'express';
import { getUserById } from '../controllers/controller_example';
import { getMessages, getUserChats } from '../controllers/chatController';

const router = express.Router();

// Define the routes
router.get('/my-chats', getUserChats);
router.get('/:id', getMessages);

export default router;
