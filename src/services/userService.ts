import * as userRepository from '../repositories/userRepository';
import { AppError, catchAsync } from '../utility';

export const AddToBlocked = async (blockerId: number, blockedId: number) => {
  return userRepository.AddUserToBlocked(blockerId, blockedId);
};

export const RemoveFromBlocked = async (
  blockerId: number,
  blockedId: number
) => {
  return userRepository.RemoveUserFromBlocked(blockerId, blockedId);
};

export const GetUserBlockedList = async (blockerId: number) => {
  return userRepository.GetUserBlockedList(blockerId);
};
