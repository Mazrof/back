import express from 'express';
import {
  login,
  whoami,
  signup,
  sendVerificationCodeController,
  verifyCodeController,
  sendVerificationCodeSmSController,
  logoutController,
  resetPasswordController,
  requestPasswordResetController,
} from '../controllers/authController';
import { isAuthenticated } from '../middlewares/authMiddleware';
import passport from '../services/oauth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/whoami', isAuthenticated, whoami);
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);
router.get(
  '/github',
  passport.authenticate('github', { scope: ['profile', 'email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

router.post('/send-code', isAuthenticated, sendVerificationCodeController);
router.post('/verify-code', isAuthenticated, verifyCodeController);
router.post(
  '/send-code-sms',
  isAuthenticated,
  sendVerificationCodeSmSController
);

router.post('/request-password-reset', requestPasswordResetController);
router.post('/reset-password', resetPasswordController);

router.post('/logout', isAuthenticated, logoutController);

export default router;
