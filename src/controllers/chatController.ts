import { catchAsync, AppError } from '../utility';
import prisma from '../prisma/client';
import { getUserGroupsChannelsChats } from '../services';

export const getUserChats = catchAsync(async (req, res) => {
  //TODO: ADD AUTH
  const data = await getUserGroupsChannelsChats(1);
  res.status(200).json(data);
});
