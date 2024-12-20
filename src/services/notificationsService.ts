import { MuteDuration } from './../../node_modules/.prisma/client/index.d';
import {addFcmToken,findUserById} from '../repositories/userRepository';
import { FCMNotification } from '../types';
import { AppError } from '../utility';
import admin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging';
import { ParticipiantTypes } from '@prisma/client';
import { getChannelUsers,getGroupUsers,getPersonalChatUsers,getUserMutedParticipants,getParticipantType,
    addMutedParticipant,removeMutedParticipant,updateMutedParticipant
} from '../repositories/MutedChatsRepository';
import "../config/firebase"
export const addFcmTokenService = async (userId: number, fcmToken: string) => {
    const user = await findUserById(userId);
    if (user.fcmtokens.includes(fcmToken))
        throw new AppError('user already subscriped from this device', 400);

    return await addFcmToken(userId, fcmToken);
};


export const sendNotificationService = async (userId: number,NotificationData: FCMNotification) => {
    const user = await findUserById(userId);
    /* if (!user.fcmtokens.length)
        throw new AppError('user has no device to send notification to', 400); */
    const message: MulticastMessage = {
        notification: {
          title: NotificationData.title,
          body: NotificationData.body        },
        tokens: user.fcmtokens
    };

    return await admin.messaging().sendEachForMulticast(message)
    
    
}

export const sendNotifications = async (participantId:number,senderId:number,NotificationData: FCMNotification)=>{
    const chatType=await getParticipantType(participantId);
    if (!chatType)
        throw new AppError('participant not found', 404);
    if (chatType.type.toString()===ParticipiantTypes.personalChat.toString()){
         const users=await getPersonalChatUsers(participantId);
        const mutedUsersIds=(await getUserMutedParticipants(participantId))
        const usersToSend=users.filter((user)=>!mutedUsersIds.includes(user.id)&&Number(user.id)!==Number(senderId));
        console.log("FCM Tokens",usersToSend.map((user)=>user.fcmtokens).flat());
        if (!usersToSend.length && !(usersToSend.map((user)=>user.fcmtokens).flat()).length )
            throw new AppError('no users to send notification to', 400);
        const message: MulticastMessage = {
            notification: {
              title: NotificationData.title,
              body: NotificationData.body,
              imageUrl: NotificationData.image || `${process.env.BACKEND_URL}/download.jpeg`
            },
            tokens: usersToSend.map((user)=>user.fcmtokens).flat()
            
        };
        return await admin.messaging().sendEachForMulticast(message);
    }
    else{
        const groupUsers=await getGroupUsers(participantId);
        const channelUsers=await getChannelUsers(participantId);
        const users=groupUsers.concat(channelUsers);
        const mutedUsersIds=(await getUserMutedParticipants(participantId))
        const usersToSend=users.filter((user)=>!mutedUsersIds.includes(user.id)&&Number(user.id)!==Number(senderId));
        console.log("FCM Tokens",usersToSend.map((user)=>user.fcmtokens).flat());

        const message: MulticastMessage = {
            notification: {
              title: NotificationData.title,
              body: NotificationData.body,
            },
            tokens: usersToSend.map((user)=>user.fcmtokens).flat()
            
        };
        return await admin.messaging().sendEachForMulticast(message);
    }
}

export const addMutedParticipantService=async (participantId:number,userId:number,MuteDuration:MuteDuration)=>{
    return await addMutedParticipant(participantId,userId,MuteDuration);
}

export const removeMutedParticipantService=async (participantId:number,userId:number)=>{
    return await removeMutedParticipant(participantId,userId);
}

export const updateMutedParticipantService=async (participantId:number,userId:number,MuteDuration:MuteDuration)=>{
    return await updateMutedParticipant(participantId,userId,MuteDuration);
}
