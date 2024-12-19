"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var groupMemberController_1 = require("../controllers/groupMemberController");
var router = express_1.default.Router({
    mergeParams: true,
});
/**
 * Routes for managing group members.
 */
/**
 * @route GET /
 * @description Fetch all members of a group.
 * @access Public (Anyone can access)
 *
 * @route POST /
 * @description Add a new member to a group.
 * @access Restricted (Based on permissions)
 */
router.route('/').get(groupMemberController_1.getGroupMembers).post(groupMemberController_1.addGroupMember);
/**
 * Routes for a specific group member identified by their ID.
 *
 * @route PATCH /:id
 * @description Update details of a group member.
 * @access Restricted (Admins only, with permissions for roles, messaging, downloading)
 *
 * @route DELETE /:id
 * @description Remove a member from a group.
 * @access Restricted (Based on permissions or for the user itself)
 */
router.route('/:id').patch(groupMemberController_1.updateGroupMember).delete(groupMemberController_1.deleteGroupMember);
exports.default = router;
