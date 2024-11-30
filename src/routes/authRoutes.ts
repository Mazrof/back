import express from "express";
import { login, whoami ,signup, sendVerificationCodeController, verifyCodeController, sendVerificationCodeSmSController, logoutController,resetPasswordController,requestPasswordResetController} from "../controllers/authController";
import { isAuthenticated } from "../middlewares/authMiddleware";
import passport from "../services/oauth";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/whoami", isAuthenticated, whoami);
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),

  );
  
  // Google OAuth callback
  router.get(
    "/google/callback",
    passport.authenticate("google", {failureRedirect: `${process.env.FRONTEND_URL}/login`}),
    (req, res) => {
      console.log("google callback",req.user)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req.session.user = { id: (req.user as any).id, userType: 'user' }; // Store user in session
      res.redirect(`${process.env.FRONTEND_URL}`);
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
      req.session.user = { id: req.user.id, userType: 'user' }; // Store user in session
      res.redirect(`${process.env.FRONTEND_URL}`);
    }
  );

  router.post('/send-code',isAuthenticated, sendVerificationCodeController);
router.post('/verify-code',isAuthenticated,verifyCodeController);
router.post('/send-code-sms',isAuthenticated,sendVerificationCodeSmSController);

router.post("/request-password-reset",requestPasswordResetController)
router.post("/reset-password",resetPasswordController)

router.post("/logout",isAuthenticated,logoutController)
  

export default router;
