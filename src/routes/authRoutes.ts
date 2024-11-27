/* // src/routes/authRoutes.ts

import { Router } from 'express';
import { signupController,loginController ,OAuthController,OAuthCallbackController,githubOAuthController,githubOAuthCallbackController,sendVerificationCodeController,verifyCodeController,sendVerificationCodeSmSController,SendJWTController} from '../controllers/authController';


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
authRouter.get('/send-jwt',SendJWTController);

export default authRouter;
 */

import express from "express";
import { login, whoami ,signup, sendVerificationCodeController, verifyCodeController, sendVerificationCodeSmSController} from "../controllers/authController";
import { isAuthenticated } from "../middlewares/authMiddleware";
import passport from "../services/oauth";
import { AppError } from "../utility";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/whoami", isAuthenticated, whoami);
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
  // Google OAuth callback
  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/");
    }
  );
  router.get(
    "/github",
    passport.authenticate("github", { scope: ["profile", "email"] })
  );
  
  
  router.get(
    "/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  router.post('/send-code', sendVerificationCodeController);
router.post('/verify-code',verifyCodeController);
router.post('/send-code-sms',sendVerificationCodeSmSController);

router.post("/logout", (req, res) => {
    req.logout((err) => {
      if (err) throw new AppError("Failed to logout", 500);
      res.clearCookie("connect.sid");
      res.status(200).json({ status: "success", data: { message: "Logged out" } });
    });
  });
  

export default router;
