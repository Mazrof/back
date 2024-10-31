import { prisma, Schemas } from '../prisma/client';

const createUser = async (data: Schemas.messagesCreateInput) => {
  return prisma.messages.create({
    data,
  });
};

export { createUser };
