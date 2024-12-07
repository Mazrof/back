import * as storiesRepository from '../repositories/storiesRepository';
import {
  getFileFromFirebase,
  uploadFileToFirebase,
} from '../third_party_services';
import {
  addUserView,
  checkStoryExpiry,
  getViewCount,
} from '../repositories/storiesRepository';

export const createStory = async (userId, content, storyMedia) => {
  const expiryDate = new Date();
  expiryDate.setHours(new Date().getHours() + 24);
  if (storyMedia) {
    storyMedia = await uploadFileToFirebase(storyMedia);
  }
  return await storiesRepository.createStory(
    userId,
    content,
    expiryDate,
    storyMedia
  );
};

export const getStoryById = async (id: number, curUserId: number) => {
  const story: any = await storiesRepository.findStoryById(id);
  if (!story) {
    return;
  }
  if (!(await checkStoryExpiry(story))) {
    return;
  }
  await addUserView(story.id, curUserId);
  story.viewCount = await getViewCount(story.id);
  story.StoryMedia = await getFileFromFirebase(story.mediaUrl);
  delete story.mediaUrl;
  return story;
};

export const getUserStories = async (userId: number, curUserId: number) => {
  const stories: any[] = await storiesRepository.findStoriesByUserId(userId);
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    if (!(await checkStoryExpiry(story))) {
      stories.splice(i, 1);
      i--;
    } else {
      await addUserView(story.id, curUserId);
      story.viewCount = await getViewCount(story.id);
      story.StoryMedia = await getFileFromFirebase(story.mediaUrl);
      delete story.mediaUrl;
    }
  }
  return stories;
};

export const deleteStoryById = async (id: number) => {
  return await storiesRepository.deleteStoryById(id);
};
