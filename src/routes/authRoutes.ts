// src/routes/authRoutes.ts

import { Router } from 'express';
import { signupController,loginController ,OAuthController,OAuthCallbackController,githubOAuthController,githubOAuthCallbackController,sendVerificationCodeController,verifyCodeController,sendVerificationCodeSmSController} from '../controllers/authController';


const authRouter = Router();


authRouter.post('/signup', signupController);
authRouter.post('/login', loginController);
authRouter.get('/google', OAuthController);
authRouter.get('/google/callback', OAuthCallbackController);
authRouter.get('/github', githubOAuthController);
authRouter.get('/github/callback', githubOAuthCallbackController);
authRouter.post('/send-code', sendVerificationCodeController);
authRouter.post('/verify-code',verifyCodeController);
authRouter.post('/send-code-sms',sendVerificationCodeSmSController);


export default authRouter;
