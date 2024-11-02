// this folder defines the endpoints and map them to controllers.

// src/routes/index.ts
import express from 'express';
import example_router from './route_example';
import groupRoutes from './groupRoutes'
import adminRoutes from './adminRoutes'

const router = express.Router();

router.use('/v1/groups', groupRoutes);
router.use('/v1/admins', adminRoutes);
router.use('/example',example_router);

export default router;
