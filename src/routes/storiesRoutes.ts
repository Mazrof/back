const express = require('express');
const storiesController = require('./../controllers/storiesController');

const router = express.Router();

//TODO add user authentication

router
  .route('/')
  .get(storiesController.getAllUserStories)
  .post(storiesController.addStory);
router
  .route('/:id')
  .get(storiesController.getStory)
  .delete(storiesController.deleteStory);

export default router;
