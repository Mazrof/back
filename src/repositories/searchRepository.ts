import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findProfilesByUsername = async (username: string) => {
  return prisma.$queryRaw`
        SELECT id,
               username               AS name,
               photo,
               screen_name            AS screenName,
               profile_pic_visibility AS profilePicVisibility
        FROM users
        WHERE LOWER(username) LIKE LOWER(${`%${username}%`});
    `;
};

export const findGroupByGroupName = async (groupName: string) => {
  return prisma.$queryRaw`
        SELECT name,
               groups.id
        FROM communities,
             groups
        WHERE communities.privacy = true
          --TODO uncomment when db is updated
          --  AND communities.active = true
          AND communities.id = groups.community_id
          AND LOWER(communities.name) LIKE LOWER(${'%' + groupName + '%'})
    `;
};

export const findChannelByChannelName = async (channelName: string) => {
  return prisma.$queryRaw`
        SELECT name,
               channels.id
        FROM communities,
             channels
        WHERE communities.privacy = true
          --TODO uncomment when db is updated
          --  AND communities.active = true
          AND communities.id = channels.community_id
          AND LOWER(communities.name) LIKE LOWER(${'%' + channelName + '%'})
    `;
};
