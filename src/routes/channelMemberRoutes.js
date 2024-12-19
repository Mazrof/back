"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var channelMemberController_1 = require("../controllers/channelMemberController");
var router = express_1.default.Router({
    mergeParams: true,
});
// Routes for channel members
router
    .route('')
    .get(channelMemberController_1.getChannelMembers) // Anyone can access
    .post(channelMemberController_1.addChannelMember);
router
    .route('/:id')
    .patch(channelMemberController_1.updateChannelMember) // Admins only (role, messaging, downloading)
    .delete(channelMemberController_1.deleteChannelMember); // Based on permissions or the user itself
exports.default = router;
