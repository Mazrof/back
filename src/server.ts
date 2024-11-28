import express from 'express';
import { config } from 'dotenv';
config()

import App from './app';
import http from 'http';
import { Server } from 'socket.io';
import { Chat } from './sockets/chat';
const PORT = 3000;

process.on('uncaughtException', (err: Error) => {
  console.log('ERROR 🔥: ', err);
  io.emit('server:shutdown', { message: 'Server encountered an issue' });
  process.exit(1);
});

const startServer = () => {
  const app = express();
  let server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
    maxHttpBufferSize: 10e6,
  });
  Chat.getInstance(io);
  App(app);
  server.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`);
  });
  return { server, io };
};

export const { server, io } = startServer();

process.on('unhandledRejection', (err: Error) => {
  console.log('ERROR 🔥: ', err.name, err.message);
  io.emit('server:shutdown', {
    message: 'Server is shutting down for maintenance',
  });
  console.log('Shutting down ...');
  console.log(err);
  // process.exit(1);//will abort all running requests
  server.close(() => {
    process.exit(1);
  });
});
