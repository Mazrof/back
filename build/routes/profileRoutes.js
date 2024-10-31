"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController = require('./../controllers/profileController');
const router = express_1.default.Router();
// TODO: add user authentication
router.post('/', profileController.addProfile);
router.patch('/:userId', profileController.getProfile);
router.get('/:userId', profileController.updateProfile);
// TODO: add admin authentication
router.get('/', profileController.getAllProfiles);
// Export the router
exports.default = router;
