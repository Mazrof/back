import { PrismaClient, Prisma } from '@prisma/client';
import { log } from 'node:util';
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
    testPrismaConnection(); // Test connection on startup
  })
  .then(async () => {
    // delete expired messages
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

export default prisma;

export { prisma, PrismaClient, Prisma as Schemas };
