import { Server, Socket } from 'socket.io';

import { handleNewConnection } from './listeners/chatListeners';

type UserSocketMap = Map<number, Socket>; // Maps user ID to Socket
type SocketUserMap = Map<string, number>;

class Chat {
  private onlineUsers: UserSocketMap = new Map();
  private socketToUserMap: SocketUserMap = new Map();
  private static _instance: Chat;
  private constructor(private io: Server) {
    this.setUpListeners();
  }
  addUser(userId: number, socket: Socket) {
    this.onlineUsers.set(userId, socket);
    this.socketToUserMap.set(socket.id, userId);
  }
  getUserUsingSocketId(socketId: string) {
    return this.socketToUserMap.get(socketId);
  }
  setUpListeners() {
    this.io.on('connection', handleNewConnection);
  }
  isOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }
  removeUser(socketId: string) {
    const userId = this.socketToUserMap.get(socketId);
    if (userId !== undefined) {
      this.onlineUsers.delete(userId);
      this.socketToUserMap.delete(socketId);
      return userId;
    }
    return -1;
  }
  static getInstance(io?: Server) {
    if (!this._instance) {
      if (io) this._instance = new Chat(io);
      else throw new Error(`io is not defined: ${io}`);
    }
    return this._instance;
  }
}
export { Chat };

//TODO: error handling
//TODO: UNIT TEST

// io.use((socket, next) => {
//   // Middleware logic, e.g., authentication
//   const isAuthenticated = true; // Replace with your logic
//   if (isAuthenticated) {
//     next(); // Proceed to the event handler
//   } else {
//     next(new Error("Authentication error")); // Reject connection
//   }
// });
// io.use((socket: Socket, next: Function) => {
//   const token = socket.handshake.headers['token'];
//   if (isValidToken(token)) { // isValidToken is a function to validate your token
//     return next();
//   }
//   return next(new Error('Authentication error'));
// });
