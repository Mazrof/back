import express from 'express';
import { config } from 'dotenv';
config();

import App, { sessionMiddleware } from './app';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { Chat } from './sockets/chat';
import { IncomingMessage } from 'node:http';
import logger from './utility/logger';
import { disconnectAllUser } from './sockets/listeners/chatListeners';
const PORT = 3000;

process.on('uncaughtException', (err: Error) => {
  logger.error('ERROR 🔥: ', err);
  disconnectAllUser();
  io.emit('server:shutdown', { message: 'Server encountered an issue' });
  process.exit(1);
});
const wrapMiddlewareForSocket =
  (
    // eslint-disable-next-line no-unused-vars
    middleware: (socket: IncomingMessage, res: object, next: object) => void
  ) =>
  (socket: Socket, next: object) => {
    middleware(socket.request, {}, next);
  };

const startServer = () => {
  const app = express();
  let server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [`${process.env.FRONTEND_URL}`, 'http://localhost:3000'], // Adjust based on your front-end domain
      credentials: true, // Allow cookies to be sent
    },
    maxHttpBufferSize: 10e6,
  });

  io.use(wrapMiddlewareForSocket(sessionMiddleware));
  Chat.getInstance(io);
  App(app);
  server.listen(PORT, () => {
    logger.info(`Server run on port ${PORT}`);
  });
  return { server, io };
};

export const { server, io } = startServer();

process.on('unhandledRejection', (err: Error) => {
  logger.error('ERROR 🔥: ', err.name, err.message);
  io.emit('server:shutdown', {
    message: 'Server is shutting down for maintenance',
  });
  gracefulShutdown();
});
let isShuttingDown = false;

function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info('Starting graceful shutdown...');
  disconnectAllUser();
  server.close(() => {
    logger.info('Closed all connections and server stopped.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.warn('Force shutdown after 10 seconds.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
