"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var controllers_1 = require("../controllers");
var channelMemberRoutes_1 = require("./channelMemberRoutes");
var router = express_1.default.Router({
    mergeParams: true,
});
/**
 * Routes for managing channels.
 */
/**
 * @route GET /
 * @description Fetch all channels based on privacy settings.
 * @access Restricted (requires authentication)
 *
 * @route POST /
 * @description Create a new channel.
 * @access Restricted (requires authentication)
 */
router.route('/').get(controllers_1.getAllChannels).post(controllers_1.createChannel);
/**
 * @route POST /invitation
 * @description Invite a member to a channel.
 * @access Restricted (Admins of channel only)
 */
router.route('/invitation').post(controllers_1.inviteChannelMember);
/**
 * Use channelMemberRouter for routes related to channel members.
 */
router.use('/:channelId/members', channelMemberRoutes_1.default);
/**
 * Routes for a specific channel identified by its ID.
 *
 * @route GET /:id
 * @description Fetch a channel based on privacy settings and membership.
 * @access Restricted (Admins or members only)
 *
 * @route PATCH /:id
 * @description Update a channel's details (Admins only).
 * @access Restricted (Admins only)
 *
 * @route DELETE /:id
 * @description Delete a channel (Admins only).
 * @access Restricted (Admins only)
 */
router.route('/:id').get(controllers_1.getChannel).patch(controllers_1.updateChannel).delete(controllers_1.deleteChannel);
exports.default = router;
