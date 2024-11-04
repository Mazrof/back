import express, { Request, Response, Router } from 'express';
import {
  addProfile,
  updateProfile,
  getAllProfiles,
  getProfile,
} from '../controllers/profileController';

const router: Router = express.Router();

// TODO: add user authentication

router.post('/', addProfile);

router.patch('/:id', updateProfile);

router.get('/:id', getProfile);

// TODO: add admin authentication

router.get('/', getAllProfiles);

// Export the router
export default router;
