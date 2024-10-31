"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
//TODO add user authentication
router.route('/').get().post();
router.route('/:storyId').get().delete();
exports.default = router;
