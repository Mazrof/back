"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Import required modules and controllers.
 */
var express_1 = require("express");
var controllers_1 = require("../controllers");
var router = express_1.default.Router();
/**
 * Routes related to user management, restricted to authorized users only.
 */
/**
 * @route GET /users
 * @description Fetch all users from the system.
 * @access Restricted (Admin-only)
 */
router.get('/users', controllers_1.getAllUsers);
/**
 * @route PATCH /:userId
 * @description Ban or toggle the status of a user by their ID.
 * @access Restricted (Admin-only)
 */
router.patch('/:userId', controllers_1.banUser);
/**
 * Group-related routes.
 */
/**
 * @route POST /:groupId
 * @description Apply content filtering settings to a group by its ID.
 * @access Restricted (Admin-only)
 */
router.post('/:groupId', controllers_1.applyContentFilter);
/**
 * Export the configured router for use in the application.
 */
exports.default = router;
