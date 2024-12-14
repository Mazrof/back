import {addFcmToken,findUserById} from '../repositories/userRepository';
import { FCMNotification } from '../types';
import { AppError } from '../utility';
import admin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging';
import "../config/firebaseNotification";
export const addFcmTokenService = async (userId: number, fcmToken: string) => {
    const user = await findUserById(userId);
    if (user.fcmtokens.includes(fcmToken))
        throw new AppError('user already subscriped from this device', 400);

    return await addFcmToken(userId, fcmToken);
};


export const sendNotificationService = async (userId: number,NotificationData: FCMNotification) => {
    const user = await findUserById(userId);
    if (!user.fcmtokens.length)
        throw new AppError('user has no device to send notification to', 400);
    const message: MulticastMessage = {
        notification: {
          title: NotificationData.title,
          body: NotificationData.body,
          imageUrl: NotificationData.image || `${process.env.BACKEND_URL}/download.jpeg`
        },
        tokens: user.fcmtokens
        
    };
    return await admin.messaging().sendEachForMulticast(message);
    
    
}
