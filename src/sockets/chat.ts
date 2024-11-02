// import { Server, Socket } from 'socket.io';
// import { Messages } from '@prisma/client';
// import {
//   createMessage,
//   getParticipantIdsOfUserGroups,
//   getParticipantIdsOfUserPersonalChats,
//   getParticipantIdsOfUserChannles,
// } from '../services';
// import { uploadFileToFirebase } from '../third_party_services';
// import logger from '../utility/logger';
//
// type UserSocketMap = { [key: number]: Socket };
// class Chat {
//   private onlineUsers: UserSocketMap[];
//
//   constructor(private io: Server) {
//     this.setUpListeners();
//     this.onlineUsers = [];
//   }
//   setUpListeners() {
//     this.io.on('connection', async (socket: Socket) => {
//       logger.info('User connected');
//       // add user to his personal chats,groups,channels
//       const userParticipants: number[] = [];
//       const participantIdsOfUserPersonalChats =
//         await getParticipantIdsOfUserPersonalChats(1);
//       const participantIdsOfUserGroups = await getParticipantIdsOfUserGroups(1);
//       const participantIdsOfUserChannels =
//         await getParticipantIdsOfUserChannles(1);
//
//       userParticipants.push(...participantIdsOfUserPersonalChats);
//       userParticipants.push(...participantIdsOfUserGroups);
//       userParticipants.push(...participantIdsOfUserChannels);
//       console.log(userParticipants);
//       userParticipants.forEach((chatId) => {
//         socket.join(chatId.toString());
//       });
//
//       this.onlineUsers.push({ 1: socket });
//
//       //TODO: update all message to him to be deliveredAt this moment may be in the my-chats route
//
//       // this.onlineUsers.push({123:socket})
//       // console.log(this.isOnline(123))
//       // console.log(this.getUserSocket(123))
//
//       socket.on('message:sent', async (message: Messages) => {
//         console.log('create message', message);
//         await this.handleNewMessage(socket, message);
//       });
//       socket.on('message:edited', (message: Messages) => {
//         this.handleEditMessage(socket, message);
//       });
//       socket.on('message:deleted', (message: Messages) => {
//         this.handleDeleteMessage(socket, message);
//       });
//       socket.on('message:get-info', (message: Messages) => {
//         this.handleMessageInfo(socket, message);
//       });
//       socket.on('context:opened', (data: { id: number }) => {
//         // data.contextId,
//         //TODO: update user seen_at date for messsages of this context for the user who make the request
//         //query: message join userDelivery on messageID where conext = contextId and recieverUser = requestedUser
//         // 1-get all messages that are unseen in this context
//         // 2-update seen_at from message delviey table when id  in (array from the previous step)
//         // tell other people about that update
//         // this.io.to(message.contextId.toString()).emit('message:update-info',message)
//       });
//     });
//   }
//   async handleNewMessage(socket: Socket, message: Messages) {
//     console.log(message);
//     if (message.content && message.content.length > 100) {
//       message.url = await uploadFileToFirebase(message.content);
//       message.content = null; // to avoid saving it in db
//     }
//     //TODO:
//     // message.senderId = user.id;
//     //TODO: in the frontend emit('context:opened when a new message')
//     // add (derived at ,read at) =: =: > TABLE
//     const createdMessage = await createMessage(message);
//     this.io
//       .to(message.participantId.toString())
//       .emit('message:receive', createdMessage);
//     //TODO: DELETE THIS
//     //TODO: WHAT IF THE ROW WAS NOT INSTERED AND YOU SAVE IT IN FIREBASE
//
//     this.io.emit('message:receive', createdMessage);
//     if (message.durationInMinutes) {
//       setTimeout(
//         () => {
//           this.handleDeleteMessage(socket, createdMessage);
//         },
//         message.durationInMinutes * 60 * 1000
//       );
//     }
//   }
//
//   handleEditMessage(socket: Socket, message: Messages) {
//     //TODO: edit in db
//     this.io
//       .to(message.participantId.toString())
//       .emit('message:edited', message);
//   }
//   handleDeleteMessage(socket: Socket, message: Messages) {
//     //TODO: mark this message as deleted, make content null,
//     //TODO: delete from firebase
//     //TODO: determine who can delete and post files in firebase
//     //TODO:this.io.to(message.contextId.toString()).emit('message:edited', message)
//     // deleteFileFromFirebase('http://example.com/uploads/fileurl');
//     console.log('deleted message', message);
//     this.io
//       .to(message.participantId.toString())
//       .emit('message:deleted', message);
//   }
//   handleMessageInfo(socket: Socket, message: Messages) {
//     //
//     this.io
//       .to(message.participantId.toString())
//       .emit('message:update-info', message);
//   }
//   isOnline(userId: number): boolean {
//     return this.getUserSocket(userId) !== undefined;
//   }
//   getUserSocket(userId: number): Socket | undefined {
//     const userSocket = this.onlineUsers.find(
//       (userSocket) => userId in userSocket
//     );
//     if (userSocket) return userSocket[userId];
//     return undefined;
//   }
// }
// export default (io: Server) => {
//   new Chat(io);
// };
//
// // prisma.participants.deleteMany().then((d) => console.log(d));
// // prisma.participants
// //   .create({
// //     data: {
// //       personalChatId: 2,
// //     },
// //   })
// //   .then((d) => console.log(d))
// //   .catch((d) => console.log(d));
// //TODO: DROP COLUMN ATTACKMENT,EXPIREAT
