import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { config } from 'dotenv';
config();
import { Server } from 'socket.io';
import App from './app';
import http from 'http';
import chat from './sockets/chat';
const PORT = 3000;

process.on('uncaughtException', (err: Error) => {
  console.log('ERROR 🔥: ', err);
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
  chat(io);
  // TODO: connect to db
  // await connectToDB();
  App(app);
  server.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`);
  });
  return server;
};

export const server = startServer();

process.on('unhandledRejection', (err: Error) => {
  console.log('ERROR 🔥: ', err.name, err.message);
  console.log('Shutting down ...');
  // process.exit(1);//will abort all running requests
  server.close(() => {
    process.exit(1);
  });
});
