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
} from '../../services';
import {
  deleteFileFromFirebase,
  uploadFileToFirebase,
} from '../../third_party_services';
import { Messages } from '@prisma/client';
import { Chat } from '../chat';
import { io } from '../../server';
import logger from '../../utility/logger';
import { catchAsyncSockets } from '../../utility';
export interface NewMessages extends Messages {
  receiverId?: number;
}
export const handleNewMessage = async (
  socket: Socket,
  callback: (arg: object) => void,
  message: NewMessages
) => {
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
  const roomSockets = io.sockets.adapter.rooms.get(
    message.participantId.toString()
  );
  const messageReadReceipts = [];
  if (roomSockets) {
    for (const socketId of roomSockets) {
      const userId = Chat.getInstance().getUserUsingSocketId(
        socketId
      ) as number;
      const socket = io.sockets.sockets.get(socketId);
      //TODO: GET THIS FROM AUTH
      // if(userId !== message.senderId)
      messageReadReceipts.push(
        await insertMessageRecipient(userId, createdMessage)
      );
      //if any event with name "" then append to this array

      // if (socket) {
      //   socket.emit('message:receive', { MSG: message });
      // }
    }
  }
  io.to(message.participantId.toString()).emit('message:receive', {
    ...createdMessage,
    messageReadReceipts,
  });
  //TODO: WHAT IF THE ROW WAS NOT INSTERED AND YOU SAVE IT IN FIREBASE

  if (message.durationInMinutes) {
    setTimeout(
      () => {
        handleDeleteMessage(createdMessage);
      },
      message.durationInMinutes * 60 * 1000
    );
  }
};
export const handleDeleteMessage = async (data: { id: number }) => {
  //TODO: determine who can delete and post files in firebase
  const message = await getMessageById(data.id);
  if (!message) {
    //TODO: RETURN ERROR HERE
  }
  console.log('deleted message', message);
  if (message!.url) await deleteFileFromFirebase(message!.url);
  await deleteMessage(message!.id);

  io.to(message!.participantId.toString()).emit('message:deleted', {
    message: { id: message!.id, participantId: message!.participantId },
  });
};

export const handleEditMessage = async (socket: Socket, data: Messages) => {
  // TODO:problem of drafted messages(discuss with frontend)
  logger.info(`message with id ${data.id} is being edited`);
  const message = await getMessageById(data.id);
  if (!message) {
    //TODO: WHAT if message doesn't exist
    return;
  }
  if (data.status === 'drafted') {
    //TODO: return error "you can not make the message drafted"
  }
  console.log(message);
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
  const { content, status, isAnnouncement } = data;
  const updatedMessage = await updateMessageById(data.id, {
    content,
    status,
    isAnnouncement,
    url,
  });
  io.to(updatedMessage.participantId.toString()).emit(
    'message:edited',
    updatedMessage
  );
};

export const handleOpenContext = async (data: { participantId: number }) => {
  //TODO: get the data of the user from req after auth
  const updatedMessages = await markMessagesAsRead(1, data.participantId);
  io.to(data.participantId.toString()).emit(
    'message:update-info',
    updatedMessages
  );
};

export const handleNewConnection = async (socket: Socket) => {
  //TODO: DELETE THIS
  const userId = 4;
  logger.info(`User ${userId} connected`);
  const chatInstance = Chat.getInstance();
  chatInstance.addUser(userId, socket);
  const userParticipants = await getAllParticipantIds(userId);
  console.log(userParticipants);
  // Join user to all their chat rooms
  const socketJoinPromises = userParticipants.map((chatId) =>
    socket.join(chatId.toString())
  );
  await Promise.all(socketJoinPromises);
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
    async (message: Messages, callback: (arg: object) => void) => {
      await handleNewMessage(socket, callback, message);
    }
  );
  socket.on('message:edit', async (message: Messages) => {
    await handleEditMessage(socket, message);
  });
  socket.on(
    'message:delete',
    catchAsyncSockets(async (message: Messages) => {
      await handleDeleteMessage(message);
    }, socket)
  );
  socket.on('context:opened', handleOpenContext);
  socket.on('disconnect', () => {
    Chat.getInstance().removeUser(socket.id);
  });
};
