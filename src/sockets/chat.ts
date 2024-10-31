import { Server, Socket } from 'socket.io';
import { deleteFileFromFirebase, uploadFileToFirebase } from '../utility';
import { Messages } from '@prisma/client';
import { createMessage } from '../services';

type UserSocketMap = { [key: number]: Socket };
class Chat {
  private onlineUsers: UserSocketMap[];

  constructor(private io: Server) {
    this.setUpListeners();
    this.onlineUsers = [];
  }
  setUpListeners() {
    this.io.on('connection', (socket: Socket) => {
      console.log('User connected');
      //TODO: socket.join(AllhisPersonalChats.id); store them if needed
      //TODO: socket.join(hisGroups.id); store them if needed
      //TODO: socket.join(hisChannels.id); store them if needed
      //TODO: push to the online user array [userId,socket]
      //TODO: update all message to him to be deliveredAt this moment may be in the my-chats route

      // this.onlineUsers.push({123:socket})
      // console.log(this.isOnline(123))
      // console.log(this.getUserSocket(123))

      socket.on('message:sent', async (message: Messages) => {
        console.log('create message', message);
        await this.handleNewMessage(socket, message);
      });
      socket.on('message:edited', (message: Messages) => {
        this.handleEditMessage(socket, message);
      });
      socket.on('message:deleted', (message: Messages) => {
        this.handleDeleteMessage(socket, message);
      });
      socket.on('message:get-info', (message: Messages) => {
        this.handleMessageInfo(socket, message);
      });
      socket.on('context:opened', (data: { id: number }) => {
        // data.contextId,
        //TODO: update user seen_at date for messsages of this context for the user who make the request
        //query: message join userDelivery on messageID where conext = contextId and recieverUser = requestedUser
        // 1-get all messages that are unseen in this context
        // 2-update seen_at from message delviey table when id  in (array from the previous step)
        // tell other people about that update
        // this.io.to(message.contextId.toString()).emit('message:update-info',message)
      });
    });
  }
  async handleNewMessage(socket: Socket, message: Messages) {
    //add createdAt,updatedAt,add url, (derived at ,read at) ==> TABLE
    console.log(message);
    if (message.content && message.content.length > 100) {
      message.url = await uploadFileToFirebase(message.content);
      message.content = null; // to avoid saving it in db
    }
    //TODO: using paritcipinet id to know the targeted users

    //TODO:Save message in the db
    message.createdAt = new Date();
    message.updatedAt = new Date();

    const createdMessage = await createMessage(message);

    //TODO:send the messages returned from db
    //TODO:if the message has expire duration use set time out then call the even handler for delete message
    //      settimeout(()=>{this.handledeleteMessage()}),duration)
    this.io
      .to(message.participantId.toString())
      .emit('message:receive', message);
    //TODO: DELETE THIS;
    this.io.emit('message:receive', message);
  }
  handleEditMessage(socket: Socket, message: Messages) {
    //TODO: edit in db
    this.io
      .to(message.participant_id.toString())
      .emit('message:edited', message);
  }
  handleDeleteMessage(socket: Socket, message: Messages) {
    //TODO: mark this message as deleted, make content null,
    //TODO: delete from firebase
    //TODO: determine who can delete and post files in firebase
    //TODO:this.io.to(message.contextId.toString()).emit('message:edited', message)
    deleteFileFromFirebase('http://example.com/uploads/fileurl');

    this.io
      .to(message.participant_id.toString())
      .emit('message:deleted', message);
  }
  handleMessageInfo(socket: Socket, message: Messages) {
    //
    this.io
      .to(message.participant_id.toString())
      .emit('message:update-info', message);
  }
  isOnline(userId: number): boolean {
    return this.getUserSocket(userId) !== undefined;
  }
  getUserSocket(userId: number): Socket | undefined {
    const userSocket = this.onlineUsers.find(
      (userSocket) => userId in userSocket
    );
    if (userSocket) return userSocket[userId];
    return undefined;
  }
}
export default (io: Server) => {
  new Chat(io);
};
