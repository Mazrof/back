import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findProfilesByUsername = async (username: string) => {
  return prisma.$queryRaw`
        SELECT username,
               password,
               email,
               photo,
               phone,
               bio,
               screen_name              AS screenName,
               auto_download_size_limit AS autoDownloadSizeLimit,
               max_limit_file_size      AS maxLimitFileSize,
               profile_pic_visibility   AS profilePicVisibility,
               story_visibility         AS storyVisibility,
               read_receipts_enabled    AS readReceiptsEnabled,
               last_seen                AS lastSeen,
               group_add_permission     AS groupAddPermission
        FROM users
        WHERE LOWER(username) LIKE LOWER(${`%${username}%`});
    `;
};

export const findGroupByGroupName = async (groupName: string) => {
  return prisma.$queryRaw`
        SELECT *
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
        SELECT *
        FROM communities,
             channels
        WHERE communities.privacy = true
          --TODO uncomment when db is updated
        --  AND communities.active = true
          AND communities.id = channels.community_id
          AND LOWER(communities.name) LIKE LOWER(${'%' + channelName + '%'})
    `;
};
