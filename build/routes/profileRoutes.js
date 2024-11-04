"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController_1 = require("../controllers/profileController");
const router = express_1.default.Router();
// TODO: add user authentication
router.post('/', profileController_1.addProfile);
router.patch('/:id', profileController_1.updateProfile);
router.get('/:id', profileController_1.getProfile);
// TODO: add admin authentication
router.get('/', profileController_1.getAllProfiles);
// Export the router
exports.default = router;
