
import express from 'express';
import groupRoutes from './groupRoutes'
import adminRoutes from './adminRoutes'
import authRouter from './authRoutes';

const router = express.Router();

router.use('/v1/groups', groupRoutes);
router.use('/v1/admins', adminRoutes);
router.use('/v1/auth', authRouter);

export default router;
