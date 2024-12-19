"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var userController_1 = require("../controllers/userController");
var router = express_1.default.Router();
// TODO: add user authentication
router.get('/block', userController_1.GetBlockList);
router.delete('/:id/block', userController_1.RemoveFromBlocked);
router.post('/:id/block', userController_1.AddToBlockList);
// Export the router
exports.default = router;
