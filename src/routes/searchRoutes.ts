import express, { Request, Response, Router } from 'express';
const searchController = require('./../controllers/searchController');

const router: Router = express.Router();

// TODO: add user authentication
router.get('/user', searchController.userSearch);
router.get('/channel', searchController.channelSearch);
router.get('/group', searchController.groupSearch);

// Export the router
export default router;
