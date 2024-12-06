import { PrismaClient, Prisma } from '@prisma/client';
import {
  handleDeleteMessage,
  MySocket,
} from '../sockets/listeners/chatListeners';
const prisma = new PrismaClient();

async function testPrismaConnection() {
  try {
    // Try a simple query to check the connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Prisma is connected to the database successfully.');
  } catch (error) {
    console.error('Failed to connect to the database with Prisma:', error);
  }
}

prisma
  .$connect()
  .then(() => {
    testPrismaConnection().then(); // Test connection on startup
  })
  .then(async () => {
    //TODO: REFACTOR THIS

    // delete expired messages
    const messages = await prisma.messages.findMany({
      where: {
        durationInMinutes: {
          not: null,
        },
      },
      select: {
        id: true,
        durationInMinutes: true,
        createdAt: true,
        senderId: true,
      },
    });

    const currentTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
    for (const message of messages) {
      const messageDeletionTime =
        message!.durationInMinutes! * 1000 * 60 + message!.createdAt!.getTime();
      if (messageDeletionTime < currentTime.getTime())
        await handleDeleteMessage(
          { user: { id: message.senderId } } as MySocket,
          undefined,
          { id: message.id }
        );
      else {
        setTimeout(() => {
          handleDeleteMessage(
            { user: { id: message.senderId } } as MySocket,
            undefined,
            {
              id: message.id,
            }
          );
        }, messageDeletionTime - currentTime.getTime());
      }
    }
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

export default prisma;

export { prisma, PrismaClient, Prisma as Schemas };
