import express from 'express';
import groupRoutes from './groupRoutes';
import adminRoutes from './adminRoutes';
import authRouter from './authRoutes';
import channelRoutes from './channelRoutes';
import profileRouter from './profileRoutes';
import storiesRouter from './storiesRoutes';
import searchRouter from './searchRoutes';
import userRouter from './userRoutes';
import chatRoutes from './chatRoutes';
import notifactionsRouter from './notificationsRoutes';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = express.Router();

router.use('/v1/auth', authRouter);
router.use(isAuthenticated);
router.use('/v1/admins', adminRoutes);
router.use('/v1/groups', groupRoutes);
router.use('/v1/channels', channelRoutes);
router.use('/v1/profile', profileRouter);
router.use('/v1/stories', storiesRouter);
router.use('/v1/search', searchRouter);
router.use('/v1/user', userRouter);
router.use('/v1/chats', chatRoutes);
router.use('/v1/notifications', notifactionsRouter);

export default router;
