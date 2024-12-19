"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var groupController_1 = require("../controllers/groupController");
var groupMemberRoutes_1 = require("./groupMemberRoutes");
var groupMemberController_1 = require("../controllers/groupMemberController");
var router = express_1.default.Router({
    mergeParams: true,
});
/**
 * Routes for managing groups.
 */
/**
 * @route GET /
 * @description Fetch all groups based on privacy settings.
 * @access Restricted (requires authentication)
 *
 * @route POST /
 * @description Create a new group.
 * @access Restricted (requires authentication)
 */
router
    .route('/')
    .get(groupController_1.getAllGroups)
    .post(groupController_1.createGroup);
/**
 * @route POST /invitation
 * @description Invite a member to join a group.
 * @access Restricted (Admins or group owners only)
 */
router.route('/invitation').post(groupMemberController_1.inviteGroupMember);
/**
 * Use groupMemberRouter for routes related to group members.
 */
router.use('/:groupId/members', groupMemberRoutes_1.default);
/**
 * Routes for a specific group identified by its ID.
 *
 * @route GET /:id
 * @description Fetch a group based on privacy settings and membership.
 * @access Restricted (Admins or members only)
 *
 * @route PATCH /:id
 * @description Update a group's details (Admins only).
 * @access Restricted (Admins only)
 *
 * @route DELETE /:id
 * @description Delete a group (Admins only).
 * @access Restricted (Admins only)
 */
router
    .route('/:id')
    .get(groupController_1.getGroup)
    .patch(groupController_1.updateGroup)
    .delete(groupController_1.deleteGroup);
exports.default = router;
