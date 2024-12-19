import { Server, Socket } from 'socket.io';
import { IncomingMessage } from 'node:http';
import { io } from '../../server';
import logger from '../../utility/logger';
// import {} from // deleteFileFromFirebase,
// uploadFileToFirebase,
// '../../third_party_services';
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

export interface NewMessages extends Messages {
  messageMentions: (number | { userId: number })[];
  inputMessageMentions?: number[];
  receiverId?: number;
  channelOrGroupId: number;
  participantType: string;
  content: string;
  senderId: number;
}

export const handleNewMessage = catchSocketError(
  async (
    socket: MySocket,
    callback: (arg: object) => void,
    message: NewMessages
  ) => {
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
    userExistsInGroupOrChannel = userExistsInGroupOrChannel.map(
      (user) => user.userId
    );
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
      // content: null,
      url: null,
      participantType: undefined,
      channelOrGroupId: undefined,
    });

    // if (message.content.length > 200) {
    //   message.url = await uploadFileToFirebase(message.content);
    //   createdMessage = await updateMessageById(createdMessage.id, {
    //     url: message.url,
    //   });
    // } else {
    //   createdMessage = await updateMessageById(createdMessage.id, {
    //     content: message.content,
    //   });
    // }

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
          console.log('created message', createdMessage);
          userSockets.push(userId);
          socket.to(userId.toString()).emit('message:receive', {
            ...createdMessage,
            // content: message.content,
            url: undefined,
          });
          messageReadReceipts.push(
            await insertMessageRecipient(userId, createdMessage)
          );
        }
      }
    }
    console.log(messageReadReceipts);
    io.to(message.senderId.toString()).emit('message:receive', {
      ...createdMessage,
      // content: message.content,
      messageReadReceipts,
      url: undefined,
    });

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
    // if (message!.url) await deleteFileFromFirebase(message!.url);
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
    if (!data.content && !data.status) {
      callback({ message: 'message cannot have empty content' });
    }
    const message = await getMessageById(data.id);
    if (!message || message.senderId !== userId) {
      if (callback) callback({ message: 'message is not found' });
      logger.info('message not found');
      return;
    }
    // let url;
    // if (message.url) {
    //   await deleteFileFromFirebase(message.url);
    // }
    // const contentToBeSent = data.content;
    // if (data.content.length > 100) {
    //   url = await uploadFileToFirebase(data.content);
    //   data.content = null; // to avoid saving it in db
    // } else {
    //   url = null;
    // }
    const { content, status } = data;

    const updateData: { content: string; status?: 'pinned' | 'usual' } = {
      content,
    };
    if (status === 'pinned') {
      updateData.status = status;
    }

    const updatedMessage = await updateMessageById(data.id, updateData);

    if (message.status === MessageStatus.drafted) {
      io.to(updatedMessage.senderId.toString()).emit('message:edited', {
        ...updatedMessage,
        messageReadReceipts: undefined,
        url: undefined,
        content,
      });
      return;
    }
    io.to(updatedMessage.participantId.toString()).emit('message:edited', {
      ...updatedMessage,
      messageReadReceipts: undefined,
      url: undefined,
      content,
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
    console.log(userId);
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
  userRooms?: string[];
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
    const rooms = Array.from(socket.rooms);
    socket.userRooms = rooms;
    console.log(rooms, 'rooms');
    rooms.forEach((room) => {
      socket.broadcast.to(room).emit('user:connected', {
        socketId: socket.id,
        userId: socket.user.id,
        connected: true,
      });
    });
  }
);

// const handleCreateCall = catchSocketError(
//   async (
//     socket: MySocket,
//     callback: (arg: object) => void,
//     callDetails: object
//   ) => {}
// );
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
    logger.info(`User disconnected: ${socket.user.id.toString()}`);
    const rooms = Array.from(socket.userRooms);
    console.log(rooms);
    rooms.forEach((room) => {
      socket.broadcast.to(room).emit('user:disconnected', {
        socketId: socket.id,
        userId: socket.user.id,
        connected: false,
      });
    });

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
    console.log(socket.rooms, 'disconnected');
    await disconnectedHandler(socket);
  });
  //One to One voice call setup
  socket.on('call-user', ({ targetId, offer }) => {
    io.to(targetId).emit('incoming-call', { from: socket.id, offer });
  });
  socket.on('answer-call', ({ callerId, answer }) => {
    io.to(callerId).emit('call-answered', { from: socket.id, answer });
  });
  socket.on('ice-candidate', ({ targetId, candidate }) => {
    io.to(targetId).emit('ice-candidate', { from: socket.id, candidate });
  });

  //Group voice call setup
  socket.on('start-room', ({ roomId, participinatId }) => {
    socket.join(roomId);
    //TODO:I may need to store the current rooms
    io.to(participinatId.toString()).emit('room-created', {
      roomId,
      from: socket.id,
    });
  });
  socket.on('join-room', ({ roomId }) => {
    if (roomId) {
      socket.join(roomId);
      io.to(roomId).emit('user-joined', {
        userId: socket.id,
      });
    }
  });
  socket.on('offer', ({ roomId, offer, to }) => {
    if (roomId) {
      socket.to(roomId).emit('offer', { from: socket.id, offer, to });
    }
  });

  socket.on('answer', ({ roomId, answer, to }) => {
    if (roomId) {
      socket.to(roomId).emit('answer', { from: socket.id, answer, to });
    }
  });

  socket.on('group-ice-candidate', ({ roomId, candidate }) => {
    if (roomId) {
      socket.to(roomId).emit('ice-candidate', { from: socket.id, candidate });
    }
  });

  socket.on('leave-room', ({ roomId }) => {
    if (roomId) {
      socket.leave(roomId);
      io.to(roomId).emit('user-left', { userId: socket.id });
    }
  });
};
