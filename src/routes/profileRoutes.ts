import express, { Request, Response, Router } from 'express';
import { profileController } from './../controllers/profileController';

const router: Router = express.Router();

// TODO: add user authentication

router.post('/', profileController.addProfile);

router.patch('/:id', profileController.updateProfile);

router.get('/:id', profileController.getProfile);

// TODO: add admin authentication

router.get('/', profileController.getAllProfiles);

// Export the router
export default router;
