import {addFcmTokenService,sendNotificationService} from '../services/notificationsService';
import { Request, Response } from 'express';
import { AppError, catchAsync } from '../utility';
import { notificationSchema} from '../schemas/notificationSchema';
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
    