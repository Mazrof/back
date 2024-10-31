import express, { Request, Response, Router } from 'express';
const profileController = require('./../controllers/profileController');

const router: Router = express.Router();

// TODO: add user authentication

router.post('/', profileController.addProfile);

router.patch('/:userId', profileController.getProfile);

router.get('/:userId', profileController.updateProfile);

// TODO: add admin authentication

router.get('/', profileController.getAllProfiles);

// Export the router
export default router;
