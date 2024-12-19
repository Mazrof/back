"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var storiesController = require('./../controllers/storiesController');
var router = express.Router();
//TODO add user authentication
router
    .route('/')
    .get(storiesController.getAllUserStories)
    .post(storiesController.addStory);
router
    .route('/:id')
    .get(storiesController.getStory)
    .delete(storiesController.deleteStory);
exports.default = router;
