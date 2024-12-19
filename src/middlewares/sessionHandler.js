"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthSessionHandler = void 0;
var OAuthSessionHandler = function (req, res) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.session.user = { id: req.user.id, userType: 'user', user: req.user }; // Store user in session
    res.redirect("".concat(process.env.FRONTEND_URL));
};
exports.OAuthSessionHandler = OAuthSessionHandler;
