// src/routes/authRoutes.ts

import { Router } from 'express';
import { signupController,loginController } from '../controllers/authController';


const authRouter = Router();


authRouter.post('/signup', signupController);
authRouter.post('/login', loginController);

export default authRouter;
