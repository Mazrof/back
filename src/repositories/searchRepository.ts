import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findProfilesByUsername = async (username: string) => {
  return await prisma.$queryRaw`
        SELECT *
        FROM users
        WHERE LOWER(username) LIKE LOWER(${'%' + username + '%'})
    `;
};

export const findGroupByGroupName = async (groupName: string) => {
  return await prisma.$queryRaw`
        SELECT *
        FROM communities,
             groups
        WHERE communities.privacy = true
          AND communities.id = groups.community_id
          AND LOWER(communities.name) LIKE LOWER(${'%' + groupName + '%'})
    `;
};

export const findChannelByChannelName = async (channelName: string) => {
  return await prisma.$queryRaw`
        SELECT *
        FROM communities,
             channels
        WHERE communities.privacy = true
          AND communities.id = channels.community_id
          AND LOWER(communities.name) LIKE LOWER(${'%' + channelName + '%'})
    `;
};
