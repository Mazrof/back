import express, { Request, Response, Router } from 'express';
const searchController = require('./../controllers/searchController');

const router: Router = express.Router();

// TODO: add user authentication
router.get('', searchController.generalSearch);

// Export the router
export default router;
