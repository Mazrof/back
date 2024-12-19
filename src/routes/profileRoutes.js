"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var profileController_1 = require("../controllers/profileController");
var router = express_1.default.Router();
// TODO: add user authentication
router.post('/', profileController_1.addProfile);
router.patch('/:id', profileController_1.updateProfile);
router.get('/:id', profileController_1.getProfile);
// TODO: add admin authentication
router.get('/', profileController_1.getAllProfiles);
// Export the router
exports.default = router;
