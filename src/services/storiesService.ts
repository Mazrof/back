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

export const createStory = async (
  userId,
  content,
  storyMedia,
  mediaType,
  color
) => {
  const expiryDate = new Date();
  expiryDate.setHours(new Date().getHours() + 24);
  if (storyMedia) {
    storyMedia = await uploadFileToFirebase(storyMedia);
  }
  return await storiesRepository.createStory(
    userId,
    content,
    expiryDate,
    storyMedia,
    mediaType,
    color
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

export const getUserStories = async (curUserId: number) => {
  const allUsersStories: any[] = [];
  const userChats = await storiesRepository.findUserPersonalChats(curUserId);
  userChats.unshift({ chatId: -1, otherUserId: curUserId });
  for (const chat of userChats) {
    allUsersStories.push(
      await storiesRepository.findProfileByIdMinimal(chat.otherUserId)
    );
    allUsersStories[allUsersStories.length - 1].stories =
      await storiesRepository.findStoriesByUserId(chat.otherUserId);
  }
  for (const user of allUsersStories)
    for (let i = 0; i < user.stories.length; i++) {
      const story = user.stories[i];
      if (!(await checkStoryExpiry(story))) {
        user.stories.splice(i, 1);
        i--;
      } else {
        await addUserView(story.id, curUserId);
        story.viewCount = await getViewCount(story.id);
        story.StoryMedia = await getFileFromFirebase(story.mediaUrl);
        delete story.mediaUrl;
      }
    }
  return allUsersStories;
};

export const deleteStoryById = async (id: number) => {
  return await storiesRepository.deleteStoryById(id);
};
