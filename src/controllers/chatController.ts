import { catchAsync, AppError } from '../utility';
import prisma from '../prisma/client';
import { getUserGroupsChannelsChats, getUserParticipants } from '../services';

export const getUserChats = catchAsync(async (req, res) => {
  //TODO: ADD AUTH remove call(1)
  const data = await getUserParticipants(1);
  res.status(200).json(data);
});
