import express from 'express';
import groupRoutes from './groupRoutes';
import adminRoutes from './adminRoutes';
import authRouter from './authRoutes';
import channelRoutes from './channelRoutes';
import profileRouter from './profileRoutes';
import storiesRouter from './storiesRoutes';
import searchRouter from './searchRoutes';
const router = express.Router();

router.use('/v1/groups', groupRoutes);
router.use('/v1/admins', adminRoutes);
router.use('/v1/channels', channelRoutes);
router.use('/v1/auth', authRouter);
router.use('/v1/profile', profileRouter);
router.use('/v1/stories', storiesRouter);
router.use('/v1/search', searchRouter);
export default router;
