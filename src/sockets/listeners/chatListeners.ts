import { Server, Socket } from 'socket.io';
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
  updateUserProfile,
} from '../../services';
import {
  deleteFileFromFirebase,
  uploadFileToFirebase,
} from '../../third_party_services';
import { Messages, MessageStatus } from '@prisma/client';
import { Chat } from '../chat';
import { io } from '../../server';
import logger from '../../utility/logger';
import { updateProfile } from '../../controllers/profileController';
import client from '../../prisma/client';
export interface NewMessages extends Messages {
  messageMentions: any[];
  receiverId?: number;
}
export const handleNewMessage = async (
  socket: Socket,
  callback: (arg: object) => void,
  message: NewMessages
) => {
  if (message.status === 'drafted') {
    if (callback)
      callback({
        message:
          "you can't save a new message as drafted you are allowed to update the drafted messages only",
      });
    return;
  }
  if (!message.content) {
    //callback(err,info)
    callback({
      message: 'message is empty',
    });
    return;
  }
  if (message.receiverId) {
    // if you provide a receiver id this means I will create new personal chat
    //TODO : ADD SENDER ID FROM AUTH
    //TODO: message.senderId = user.id
    message.participantId = (await createPersonalChat(
      message.receiverId,
      //TODO:DELETE THIS 1
      1
    ))!.participants!.id;
  }
  message.messageMentions = (message.messageMentions || []).map(
    (mention: number) => ({
      userId: mention,
    })
  );
  message.receiverId = undefined;
  let createdMessage = await createMessage({
    ...message,
    content: null,
    url: null,
  });

  if (message.content.length > 100) {
    message.url = await uploadFileToFirebase(message.content);
    createdMessage = await updateMessageById(createdMessage.id, {
      url: message.url,
    });
  } else {
    createdMessage = await updateMessageById(createdMessage.id, {
      content: message.content,
    });
  }
  console.log('HI');
  const roomSockets = io.sockets.adapter.rooms.get(
    message.participantId.toString()
  );
  const messageReadReceipts = [];
  console.log(roomSockets);
  if (roomSockets) {
    for (const socketId of roomSockets) {
      const userId = Chat.getInstance().getUserUsingSocketId(
        socketId
      ) as number;
      // const socket = io.sockets.sockets.get(socketId);
      //TODO: GET THIS FROM AUTH
      //TODO: TEST ON MORE THAN ONE USER
      if (userId !== message.senderId)
        messageReadReceipts.push(
          await insertMessageRecipient(userId, createdMessage)
        );
    }
  }
  //TODO: TEST THIS
  socket.broadcast
    .to(message.participantId.toString())
    .emit('message:receive', {
      ...createdMessage,
      messageReadReceipts: undefined,
    });
  socket.emit('message:receive', createdMessage);
  if (message.durationInMinutes) {
    setTimeout(
      () => {
        handleDeleteMessage(createdMessage);
      },
      message.durationInMinutes * 60 * 1000
    );
  }
};
export const handleDeleteMessage = async (
  data: { id: number },
  callback?: (err: object) => void
) => {
  //TODO: ADD AUTH
  const message = await getMessageById(data.id);
  if (!message) {
    if (callback) callback({ message: 'message is not found' });
    console.log('message not found');
    return;
  }
  console.log('deleted message', message);
  if (message!.url) await deleteFileFromFirebase(message!.url);
  await deleteMessage(message!.id);

  io.to(message!.participantId.toString()).emit('message:deleted', {
    message: { id: message!.id, participantId: message!.participantId },
  });
};

export const handleEditMessage = async (
  socket: Socket,
  data: Messages,
  callback?: (err: object) => void
) => {
  //TODO: what if the message isn't the user message
  logger.info(`message with id ${data.id} is being edited`);
  const message = await getMessageById(data.id);
  if (!message) {
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
};

export const handleOpenContext = async (data: { participantId: number }) => {
  //TODO: get the data of the user from req after auth
  const updatedMessages = await markMessagesAsRead(1, data.participantId);
  //TODO: RETURN THIS FOR THE SENDER ONLY MODIFY THE UPPER PART
  io.to(data.participantId.toString()).emit(
    'message:update-info',
    updatedMessages
  );
};

export const handleNewConnection = async (socket: Socket) => {
  //TODO: DELETE THIS
  const userId = 2;
  //mark user as active now
  await updateUserProfile(userId, { activeNow: true, lastSeen: null });
  logger.info(`User ${userId} connected`);
  const chatInstance = Chat.getInstance();
  chatInstance.addUser(userId, socket);
  const userParticipants = await getAllParticipantIds(userId);
  console.log(userParticipants, 'participants');
  // Join user to all their chat rooms
  userParticipants.forEach((chatId) => socket.join(chatId.toString()));
  //to sync drafted messages
  socket.join(userId.toString());
  // Insert participant data and notify recipients
  const insertedData = await insertParticipantDate(userId, userParticipants);
  notifyParticipants(insertedData, socket);
  // Set up socket event handlers
  setupSocketEventHandlers(socket);
};

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
  insertedData: { participantId: number }[],
  socket: Socket
) => {
  console.log(insertedData);
  insertedData.forEach((userRecipient) => {
    //TODO:TEST THIS AFTER AUTH
    socket.broadcast
      .to(userRecipient.participantId.toString())
      .emit('message:update-info', [userRecipient]);
  });
};

const setupSocketEventHandlers = (socket: Socket) => {
  socket.on(
    'message:sent',
    async (message: NewMessages, callback: (arg: object) => void) => {
      await handleNewMessage(socket, callback, message);
    }
  );
  socket.on(
    'message:edit',
    async (message: Messages, callback: (arg: object) => void) => {
      await handleEditMessage(socket, message, callback);
    }
  );
  socket.on(
    'message:delete',
    async (message: Messages, callback: (err: object) => void) => {
      await handleDeleteMessage(message, callback);
    }
  );
  socket.on('context:opened', handleOpenContext);
  socket.on('disconnect', async () => {
    const userId = Chat.getInstance().removeUser(socket.id);
    await updateUserProfile(userId, {
      activeNow: false,
      lastSeen: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    });
  });
};
//TODO: determine who can delete and post files in firebase
