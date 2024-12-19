"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var chatController_1 = require("../controllers/chatController");
var router = express_1.default.Router();
// Define the routes
router.get('/my-chats', chatController_1.getUserChats);
router.get('/:id', chatController_1.getMessages);
exports.default = router;
