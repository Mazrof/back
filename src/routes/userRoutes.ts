import express, { Request, Response, Router } from 'express';

import {
  GetBlockList,
  AddToBlockList,
  RemoveFromBlocked,
} from '../controllers/userController';

const router: Router = express.Router();

// TODO: add user authentication

router.get('/block', GetBlockList);

router.delete('/:id/block', RemoveFromBlocked);

router.post('/:id/block', AddToBlockList);

// Export the router
export default router;
