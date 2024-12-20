import * as storiesRepository from '../repositories/storiesRepository';
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
    return null;
  }
  if (!(await checkStoryExpiry(story))) {
    return null;
  }
  await addUserView(story.id, curUserId);
  story.viewCount = await getViewCount(story.id);
  story.StoryMedia = story.mediaUrl;
  delete story.mediaUrl;
  return story;
};

export const getUserStories = async (curUserId: number) => {
  const allUsersStories: any[] = [];
  const userChats = await storiesRepository.findUserPersonalChats(curUserId);
  userChats.unshift({ chatId: 0, otherUserId: curUserId });
  for (const chat of userChats) {
    const userProfile = await storiesRepository.findProfileByIdMinimal(
      chat.otherUserId
    );
    if (userProfile) {
      allUsersStories.push(userProfile);
      if (
        allUsersStories[allUsersStories.length - 1].storyVisibility != 'nobody'
      ) {
        allUsersStories[allUsersStories.length - 1].stories =
          await storiesRepository.findStoriesByUserId(chat.otherUserId);
      }
    }
  }
  for (const user of allUsersStories)
    for (let i = 0; i < user.stories.length; i++) {
      user.photo = user.profilePicVisibility == 'nobody' ? null : user.photo;
      const story = user.stories[i];
      if (!(await checkStoryExpiry(story))) {
        user.stories.splice(i, 1);
        i--;
      } else {
        await addUserView(story.id, curUserId);
        story.viewCount = await getViewCount(story.id);
        story.StoryMedia = story.mediaUrl;
      }
    }
  return allUsersStories;
};

export const deleteStoryById = async (id: number) => {
  return await storiesRepository.deleteStoryById(id);
};
