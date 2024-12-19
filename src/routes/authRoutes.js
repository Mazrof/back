"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authController_1 = require("../controllers/authController");
var authMiddleware_1 = require("../middlewares/authMiddleware");
var oauth_1 = require("../services/oauth");
var sessionHandler_1 = require("../middlewares/sessionHandler");
var router = express_1.default.Router();
router.post('/signup', authController_1.signup);
router.post('/login', authController_1.login);
router.get('/whoami', authMiddleware_1.isAuthenticated, authController_1.whoami);
router.get('/google', oauth_1.default.authenticate('google', { scope: ['profile', 'email'] }));
// Google OAuth callback
router.get('/google/callback', oauth_1.default.authenticate('google', {
    failureRedirect: "".concat(process.env.FRONTEND_URL, "/login"),
}), sessionHandler_1.OAuthSessionHandler);
router.get('/github', oauth_1.default.authenticate('github', { scope: ['profile', 'email'] }));
router.get('/github/callback', oauth_1.default.authenticate('github', { failureRedirect: '/' }), sessionHandler_1.OAuthSessionHandler);
router.post('/send-code', authController_1.sendVerificationCodeController);
router.post('/verify-code', authController_1.verifyCodeController);
router.post('/send-code-sms', authController_1.sendVerificationCodeSmSController);
router.post('/request-password-reset', authController_1.requestPasswordResetController);
router.post('/reset-password', authController_1.resetPasswordController);
router.post('/logout', authMiddleware_1.isAuthenticated, authController_1.logoutController);
exports.default = router;
