import { Server, Socket } from 'socket.io';
import { IncomingMessage } from 'node:http';
import { io } from '../../server';
import logger from '../../utility/logger';
import {
  deleteFileFromFirebase,
  uploadFileToFirebase,
} from '../../third_party_services';
import { Messages, MessageStatus } from '@prisma/client';

import {
  createMessage,
  createPersonalChat,
  deleteMessage,
  getMessageById,
  getParticipantIdsOfUserChannels,
  getParticipantIdsOfUserGroups,
  getParticipantIdsOfUserPersonalChats,
  insertMessageRecipient,
  insertParticipantDate,
  markMessagesAsRead,
  updateMessageById,
} from '../../services';
import { Chat } from '../chat';
import { updateUserById } from '../../repositories/userRepository';
import { catchSocketError } from '../../utility';
import prisma from '../../prisma/client';
import { channel } from 'node:diagnostics_channel';

export interface NewMessages extends Messages {
  messageMentions: (number | { userId: number })[];
  inputMessageMentions?: number[];
  receiverId?: number;
  channelOrGroupId: number;
  participantType: string;
}

export const handleNewMessage = catchSocketError(
  async (
    socket: MySocket,
    callback: (arg: object) => void,
    message: NewMessages
  ) => {
    console.log(message);
    message.senderId = socket.user.id;
    if (message.status === 'drafted') {
      if (callback)
        callback({
          message:
            "you can't save a new message as drafted you are allowed to update the drafted messages only",
        });
      return;
    }
    if (!message.content) {
      callback({
        message: 'message is empty',
      });
      return;
    }
    if (message.receiverId) {
      // if you provide a receiver id this means I will create new personal chat
      message.participantId = (await createPersonalChat(
        message.receiverId,
        message.senderId
      ))!.participants!.id;
      Chat.getInstance()
        .getSocketsByUserId(message.senderId)
        .forEach((socket: MySocket) => {
          socket.join(message.participantId.toString());
        });
      Chat.getInstance()
        .getSocketsByUserId(message.receiverId)
        .forEach((socket: MySocket) => {
          socket.join(message.participantId.toString());
        });
    }

    //Check if the message replied is in this participant
    if (message.replyTo) {
      const repliedMsg = await getMessageById(message.replyTo);
      if (
        !repliedMsg ||
        repliedMsg.participantId !== message.participantId ||
        repliedMsg.status === 'drafted'
      ) {
        callback({
          message: 'message being reply to is not found',
        });
        logger.info('message being reply to is not found');
        return;
      }
    }
    //Check if the users mentioned are in this participant
    let userExistsInGroupOrChannel = [];
    if (message.inputMessageMentions)
      if (message.participantType === 'channel') {
        userExistsInGroupOrChannel = await prisma.channelSubscriptions.findMany(
          {
            where: { channelId: message.channelOrGroupId },
            select: {
              userId: true,
            },
          }
        );
      } else if (message.participantType === 'group') {
        userExistsInGroupOrChannel = await prisma.groupMemberships.findMany({
          where: { groupId: message.channelOrGroupId },
          select: {
            userId: true,
          },
        });
      } else {
        callback({ message: 'you cannot add mention in personal chats' });
      }
    let endFunction = false;
    console.log(userExistsInGroupOrChannel);
    userExistsInGroupOrChannel = userExistsInGroupOrChannel.map(
      (user) => user.userId || user.userId
    );
    console.log(userExistsInGroupOrChannel);
    message.inputMessageMentions = message.inputMessageMentions || [];
    message.inputMessageMentions.forEach((userId) => {
      if (!userExistsInGroupOrChannel.includes(userId)) {
        callback({
          message: `mention with id ${userId} doesnt exists in this group or channel`,
        });
        endFunction = true;
        return;
      }
    });
    if (endFunction) return;
    message.messageMentions = message.inputMessageMentions.map(
      (mention: number) => ({
        userId: mention,
      })
    );
    message.inputMessageMentions = undefined;
    message.receiverId = undefined;
    let createdMessage = await createMessage({
      ...message,
      content: null,
      url: null,
      participantType: undefined,
      channelOrGroupId: undefined,
    });

    if (message.content.length > 200) {
      message.url = await uploadFileToFirebase(message.content);
      createdMessage = await updateMessageById(createdMessage.id, {
        url: message.url,
      });
    } else {
      createdMessage = await updateMessageById(createdMessage.id, {
        content: message.content,
      });
    }

    const roomSockets = io.sockets.adapter.rooms.get(
      message.participantId.toString()
    );

    const messageReadReceipts = [];
    const userSockets = [];
    if (roomSockets) {
      for (const socketId of roomSockets) {
        const userId = Chat.getInstance().getUserUsingSocketId(
          socketId
        ) as number;
        if (userId !== message.senderId && !userSockets.includes(userId)) {
          userSockets.push(userId);
          socket.to(userId.toString()).emit('message:receive', createdMessage);
          messageReadReceipts.push(
            await insertMessageRecipient(userId, createdMessage)
          );
        }
      }
    }
    //
    // socket.broadcast
    //   .to(message.participantId.toString())
    //   .emit('message:receive', createdMessage);
    // Chat.getInstance()
    //   .getSocketsByUserId(socket.user.id)
    //   .forEach((socket) => {
    io.to(message.senderId.toString()).emit('message:receive', {
      ...createdMessage,
      messageReadReceipts,
    });
    // });

    if (message.durationInMinutes) {
      setTimeout(
        () => {
          handleDeleteMessage(socket, undefined, createdMessage);
        },
        message.durationInMinutes * 60 * 1000
      );
    }
  }
);

export const handleDeleteMessage = catchSocketError(
  async (
    socket: MySocket,
    callback?: (err: object) => void,
    data?: { id: number }
  ) => {
    const userId = socket.user.id;

    const message = await getMessageById(data.id);
    if (!message || message.senderId !== userId) {
      if (callback) callback({ message: 'message is not found' });
      return;
    }
    logger.info('deleted message', message);
    if (message!.url) await deleteFileFromFirebase(message!.url);
    await deleteMessage(message!.id);

    io.to(message!.participantId.toString()).emit('message:deleted', {
      message: { id: message!.id, participantId: message!.participantId },
    });
  }
);

export const handleEditMessage = catchSocketError(
  async (socket: MySocket, callback: (err: object) => void, data: Messages) => {
    const userId = socket.user.id;
    logger.info(`message with id ${data.id} is being edited`);
    if (!data.content) {
      callback({ message: 'message cannot have empty content' });
    }
    const message = await getMessageById(data.id);
    if (!message || message.senderId !== userId) {
      if (callback) callback({ message: 'message is not found' });
      logger.info('message not found');
      return;
    }
    let url;
    if (data.content) {
      if (message.url) {
        await deleteFileFromFirebase(message.url);
      }
      if (data.content.length > 100) {
        url = await uploadFileToFirebase(data.content);
        data.content = null; // to avoid saving it in db
      } else {
        url = null;
      }
    }
    const { content } = data;
    const updatedMessage = await updateMessageById(data.id, {
      content,
      url,
    });
    if (message.status === MessageStatus.drafted) {
      io.to(updatedMessage.senderId.toString()).emit('message:edited', {
        ...updatedMessage,
        messageReadReceipts: undefined,
      });
      return;
    }
    io.to(updatedMessage.participantId.toString()).emit('message:edited', {
      ...updatedMessage,
      messageReadReceipts: undefined,
    });
  }
);

export const handleOpenContext = catchSocketError(
  async (
    socket: MySocket,
    callback: (err: object) => void,
    data: { participantId: number }
  ) => {
    const userId = socket.user.id;
    const updatedMessages = await markMessagesAsRead(
      userId,
      data.participantId
    );
    updatedMessages.forEach((msg) => {
      io.to(msg.messages.senderId.toString()).emit('message:update-info', {
        ...msg,
        messages: undefined,
      });
    });
  }
);

export interface SocketRequest extends IncomingMessage {
  session?: {
    user: { id: number };
    userData: object;
  };
}
export interface MySocket extends Socket {
  user?: { id: number };
  request: SocketRequest;
}

export const handleNewConnection = catchSocketError(
  async (socket: MySocket, callback?: (arg: object) => void) => {
    const userId = socket.user.id;
    //mark user as active now
    await updateUserById(userId, { activeNow: true, lastSeen: null });
    logger.info(`User connected: ${userId}`);
    const chatInstance = Chat.getInstance();
    chatInstance.addUser(userId, socket);
    const userParticipants = await getAllParticipantIds(userId);
    // Join user to all their chat rooms
    logger.info('userParticipants', userParticipants);
    userParticipants.forEach((chatId) => socket.join(chatId.toString()));
    //to sync drafted messages and send his message readAt
    socket.join(userId.toString());
    // Insert participant data and notify recipients
    const insertedData = await insertParticipantDate(userId, userParticipants);
    notifyParticipants(insertedData, socket);
    // Set up socket event handlers
    setupSocketEventHandlers(socket);
  }
);

// Helper function to retrieve all participant IDs
const getAllParticipantIds = async (userId: number): Promise<number[]> => {
  const [personalChatIds, groupIds, channelIds] = await Promise.all([
    getParticipantIdsOfUserPersonalChats(userId),
    getParticipantIdsOfUserGroups(userId),
    getParticipantIdsOfUserChannels(userId),
  ]);
  return [...personalChatIds, ...groupIds, ...channelIds];
};

// Notify other participants about the updated info
const notifyParticipants = (
  insertedData: { participantId: number; senderId: number }[],
  socket: Socket
) => {
  insertedData.forEach((userRecipient) => {
    io.to(userRecipient.senderId.toString()).emit('message:update-info', [
      userRecipient,
    ]);
  });
};

export const disconnectedHandler = catchSocketError(
  async (socket: MySocket) => {
    logger.info(`User disconnected: ${socket.id.toString()}`);
    const userId = Chat.getInstance().removeUser(socket.id);
    await updateUserById(userId, {
      activeNow: false,
      lastSeen: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    });
  }
);

export const disconnectAllUser = () => {
  if (io)
    io.sockets.sockets.forEach((socket) => {
      disconnectedHandler(socket).then((r) => {
        socket.disconnect(true);
        logger.info(`Disconnected socket: ${socket.id}`);
      });
    });
};
export const setupSocketEventHandlers = (socket: Socket) => {
  socket.on(
    'message:sent',
    async (message: NewMessages, callback: (arg: object) => void) => {
      await handleNewMessage(socket, callback, message);
    }
  );
  socket.on(
    'message:edit',
    async (message: Messages, callback: (arg: object) => void) => {
      await handleEditMessage(socket, callback, message);
    }
  );
  socket.on(
    'message:delete',
    async (message: Messages, callback: (err: object) => void) => {
      await handleDeleteMessage(socket, callback, message);
    }
  );
  socket.on(
    'context:opened',
    async (
      data: { participantId: number },
      callback: (err: object) => void
    ) => {
      await handleOpenContext(socket, callback, data);
    }
  );
  socket.on('disconnect', async () => {
    await disconnectedHandler(socket);
  });
};

//TODO: determine who can delete and post files in firebase
//TODO: TEST MENTIONS IN GROUP
//TODO: WHEN THE USER REFRESH IT SHOULD DISCONNECT
//TODO: connect more than onetime from the same tab
//TODO: MAKE SEND MESSAGE FASTER AS POSSIBLE

//DONE
//MESSAGE REPLYIN
//mentions
//
