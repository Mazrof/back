import { catchAsync, AppError } from '../utility';
import {
  canSeeMessages,
  getMessagesService,
  getUserParticipants,
} from '../services';
import { getFileFromFirebase } from '../third_party_services';

export const getUserChats = catchAsync(async (req, res) => {
  const data = await getUserParticipants(req.session.user.id);
  res.status(200).json(data);
});

export const getMessages = catchAsync(async (req, res) => {
  const userId = req.session.user.id;
  const participantId = parseInt(req.params.id, 10);
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 100);
  if (isNaN(participantId))
    throw new AppError('please provide a valid chat id', 400);
  //the sender should be in the asked participant
  if (!(await canSeeMessages(userId, participantId)))
    throw new AppError('you are not allowed to see this chat', 403);
  const data = await getMessagesService(
    participantId,
    userId,
    limit,
    (page - 1) * limit
  );

  res.status(200).json(data);
});
