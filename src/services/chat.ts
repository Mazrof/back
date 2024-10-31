import { prisma } from '../prisma/client';

const createMessage = async (data: ) => {
  return prisma.messages.create({
    data,
  });
};

export { createMessage };
