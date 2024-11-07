// this folder defines the endpoints and map them to controllers.

// src/routes/index.ts
import express from 'express';
import example_router from './route_example';

const router = express.Router();

router.use('/example', example_router);

export default router;
export * from './chatRoutes';
