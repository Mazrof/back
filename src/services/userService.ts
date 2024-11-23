import * as userRepository from '../repositories/userRepository';
import { AppError, catchAsync } from '../utility';
export const AddToBlocked = async (blockerId, blockedId) => {
  return userRepository.AddUserToBlocked(blockerId, blockedId);
};

export const RemoveFromBlocked = async (blockerId, blockedId) => {
  return userRepository.RemoveUserFromBlocked(blockerId, blockedId);
};

export const GetUserBlockedList = async (blockerId) => {
  return userRepository.GetUserBlockedList(blockerId);
};
