import express from 'express';
import { getUserById } from '../controllers/controller_example';
import { getUserChats } from '../controllers/chatController';

const router = express.Router();

// Define the routes
router.get('/my-chats', getUserChats);

export default router;
