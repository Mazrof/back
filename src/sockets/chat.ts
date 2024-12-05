import { Server, Socket } from 'socket.io';

import { handleNewConnection, MySocket } from './listeners/chatListeners';
import { io } from '../server';

type UserSocketMap = Map<number, Socket>; // Maps user ID to Socket
type SocketUserMap = Map<string, number>;

class Chat {
  private onlineUsers: UserSocketMap = new Map();
  private socketToUserMap: SocketUserMap = new Map();
  private static _instance: Chat;
  private constructor(private io: Server) {
    this.setUpAuth();
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

  private setUpAuth() {
    this.io.use((socket: MySocket, next: (err?: Error) => void) => {
      const session = socket.request.session;
      if (session && session.user) {
        // Attach user info to the socket object for later use
        socket.user = { id: session.user.id, ...session.userData };
        next();
      } else {
        next(new Error('Unauthorized'));
      }
    });
  }
}
export { Chat };

//TODO: error handling
//TODO: UNIT TEST
//TODO: CHECK THE MENTION TO BE IN THE GROUP OR CHANNEL
