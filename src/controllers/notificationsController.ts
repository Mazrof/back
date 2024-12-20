import {addFcmTokenService,sendNotificationService,sendNotifications,
  addMutedParticipantService,removeMutedParticipantService,updateMutedParticipantService
} from '../services/notificationsService';
import { Request, Response } from 'express';
import { AppError, catchAsync } from '../utility';
import { notificationSchema } from '../schemas/notificationSchema';
export const addFcmTokenController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.session.user.id;
    const fcmToken = req.body.fcmToken
    if (!fcmToken) {
      throw new AppError('fcmToken is required', 400);
    }
  const result = await addFcmTokenService(userId, fcmToken);
  res.status(200).json({
    status: 'success',
    data: { result },
  });
});

export const sendNotificationController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.body.receiverId;
  const NotificationData = notificationSchema.parse(req.body);
  const {title,body,image} = NotificationData;
  const result = await sendNotificationService(userId, {title,body,image});
  res.status(200).json({
    status: 'success',
    data: { result },
  });
}
);

export const sendNotificationsController = catchAsync(async (req: Request, res: Response) => {
  const participantId = req.body.participantId;
  const senderId = req.session.user.id;
  const NotificationData = notificationSchema.parse(req.body);
  const {title,body,image} = NotificationData;
  const result = await sendNotifications(participantId,senderId, {title,body,image});
  res.status(200).json({
    status: 'success',
    data: { result },
  });
}
);
    

export const addMutedParticipantController = catchAsync(async (req: Request, res: Response) => {
  const participantId = req.body.participantId;
  const userId = req.session.user.id;
  const duration = req.body.duration;
  const result = await addMutedParticipantService(participantId, userId, duration);
  res.status(200).json({
    status: 'success',
    data: { result },
  });
});

export const removeMutedParticipantController = catchAsync(async (req: Request, res: Response) => {
  const participantId = req.body.participantId;
  const userId = req.session.user.id;
  const result = await removeMutedParticipantService(participantId, userId);
  res.status(200).json({
    status: 'success',
    data: { result },
  });
});

export const updateMutedParticipantController = catchAsync(async (req: Request, res: Response) => {
  const participantId = req.body.participantId;
  const userId = req.session.user.id;
  const duration = req.body.duration;
  const result = await updateMutedParticipantService(participantId, userId, duration);
  res.status(200).json({
    status: 'success',
    data: { result },
  });
});