import { Server, Socket } from 'socket.io';
import { Messages } from '@prisma/client';
import {
  createMessage,
  getParticipantIdsOfUserGroups,
  getParticipantIdsOfUserPersonalChats,
  getParticipantIdsOfUserChannles,
  markMessagesAsRead,
  insertParticiantDate,
  insertMessageRecipient,
  getMessageById,
  deleteMessage,
  updateMessageById,
  createPersonalChat,
} from '../services';
import {
  deleteFileFromFirebase,
  uploadFileToFirebase,
} from '../third_party_services';
import logger from '../utility/logger';

type UserSocketMap = Map<number, Socket>; // Maps user ID to Socket
type SocketUserMap = Map<string, number>;
interface NewMessages extends Messages {
  receiverId?: number;
}
class Chat {
  private onlineUsers: UserSocketMap = new Map();
  private socketToUserMap: SocketUserMap = new Map();

  constructor(private io: Server) {
    this.setUpListeners();
  }
  addUser(userId: number, socket: Socket) {
    this.onlineUsers.set(userId, socket);
    this.socketToUserMap.set(socket.id, userId);
  }
  setUpListeners() {
    this.io.on('connection', async (socket: Socket) => {
      logger.info('User connected');
      this.addUser(1, socket);

      // add user to his personal chats,groups,channels
      const userParticipants: number[] = [];
      const participantIdsOfUserPersonalChats =
        await getParticipantIdsOfUserPersonalChats(1);
      const participantIdsOfUserGroups = await getParticipantIdsOfUserGroups(1);
      const participantIdsOfUserChannels =
        await getParticipantIdsOfUserChannles(1);

      userParticipants.push(...participantIdsOfUserPersonalChats);
      userParticipants.push(...participantIdsOfUserGroups);
      userParticipants.push(...participantIdsOfUserChannels);

      console.log('userParticipants', userParticipants);
      userParticipants.forEach((chatId) => {
        socket.join(chatId.toString());
      });
      // for each message id with particpiant id (insert a new row)
      const insertedData = await insertParticiantDate(1, userParticipants);
      // tell others about that
      insertedData.forEach((userRecipient) => {
        this.io
          .to(userRecipient.participantId.toString())
          .emit('message:update-info', [userRecipient]);
        //TODO: DELETE THIS
        this.io.emit('message:update-info', [userRecipient]);
      });

      socket.on('message:sent', async (message: Messages) => {
        console.log('create message', message);
        await this.handleNewMessage(socket, message);
      });
      socket.on('message:edit', (message: Messages) => {
        this.handleEditMessage(socket, message);
      });
      socket.on('message:delete', (message: Messages) => {
        this.handleDeleteMessage(socket, message);
      });
      socket.on('context:opened', async (data: { participantId: number }) => {
        //TODO: get the data of the user from req after auth
        const updatedMessages = await markMessagesAsRead(1, data.participantId);
        this.io
          .to(data.participantId.toString())
          .emit('message:update-info', updatedMessages);
        //TODO: DELETE THIS LINE
        this.io.emit('message:update-info', updatedMessages);
      });

      socket.on('disconnect', () => {
        this.removeUser(socket.id);
      });
    });
  }
  async handleNewMessage(socket: Socket, message: NewMessages) {
    // if you provide a receiver id this means I will create new personal chat
    if (message.receiverId) {
      //TODO : ADD SENDER ID FROM AUTH
      message.participantId = (await createPersonalChat(
        message.receiverId,
        1
      ))!.participants!.id;
    }
    message.receiverId = undefined;

    if (message.content && message.content.length > 100) {
      message.url = await uploadFileToFirebase(message.content);
      message.content = null; // to avoid saving it in db
    }
    //TODO: message.senderId = user.id
    const createdMessage = await createMessage(message);
    console.log(createdMessage);
    const roomSockets = this.io.sockets.adapter.rooms.get(
      message.participantId.toString()
    );
    if (roomSockets) {
      for (const socketId of roomSockets) {
        const userId = this.socketToUserMap.get(socketId) as number;
        const socket = this.io.sockets.sockets.get(socketId);
        await insertMessageRecipient(userId, createdMessage);
        if (socket) {
          socket.emit('message:receive', { MSG: message });
        }
      }
    }

    this.io
      .to(message.participantId.toString())
      .emit('message:receive', createdMessage);
    //TODO: DELETE THIS
    //TODO: WHAT IF THE ROW WAS NOT INSTERED AND YOU SAVE IT IN FIREBASE

    this.io.emit('message:receive', createdMessage);
    if (message.durationInMinutes) {
      setTimeout(
        () => {
          this.handleDeleteMessage(socket, createdMessage);
        },
        message.durationInMinutes * 60 * 1000
      );
    }
  }
  async handleEditMessage(socket: Socket, data: Messages) {
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
    this.io
      .to(updatedMessage.participantId.toString())
      .emit('message:edited', updatedMessage);
  }
  async handleDeleteMessage(socket: Socket, data: { id: number }) {
    //TODO: determine who can delete and post files in firebase
    const message = await getMessageById(data.id);
    if (!message) {
      //TODO: RETURN ERROR HERE
    }
    console.log('deleted message', message);
    if (message!.url) await deleteFileFromFirebase(message!.url);
    await deleteMessage(message!.id);

    this.io.to(message!.participantId.toString()).emit('message:deleted', {
      message: { id: message!.id, participantId: message!.participantId },
    });
    //TODO: DELETE THIS
    this.io.emit('message:deleted', {
      message: { id: message!.id, participantId: message!.participantId },
    });
  }
  isOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }
  removeUser(socketId: string) {
    // Get user ID based on socket ID and remove both mappings
    const userId = this.socketToUserMap.get(socketId);
    if (userId !== undefined) {
      this.onlineUsers.delete(userId);
      this.socketToUserMap.delete(socketId);
    }
  }
}
export default (io: Server) => {
  new Chat(io);
};

//TODO: to create group or channel ==> create partitcipant also ask omar
//TODO: popluate the public key of the user
//TODO: how to start messaging on group or message
