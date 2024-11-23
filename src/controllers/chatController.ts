import { catchAsync, AppError } from '../utility';
import prisma from '../prisma/client';
import {
  canSeeMessages,
  getMessagesService,
  getUserGroupsChannelsChats,
  getUserParticipants,
} from '../services';
import { ParticipiantTypes } from '@prisma/client';

export const getUserChats = catchAsync(async (req, res) => {
  //TODO: ADD AUTH remove call(1)
  const data = await getUserParticipants(1);
  res.status(200).json(data);
});

export const getMessages = catchAsync(async (req, res) => {
  //TODO: ADD AUTH
  //TODO: CHANGE THIS
  const userId = 1;
  const participantId = parseInt(req.params.id, 10);
  if (isNaN(participantId))
    throw new AppError('please provide a valid chat id', 400);
  //the sender should be in the asked participant
  if (!(await canSeeMessages(userId, participantId)))
    throw new AppError('you are not allowed to see this chat', 403);
  const data = await getMessagesService(participantId);
  res.status(200).json(data);
});
