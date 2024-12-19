"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var searchController = require('./../controllers/searchController');
var router = express_1.default.Router();
// TODO: add user authentication
router.get('', searchController.generalSearch);
// Export the router
exports.default = router;
