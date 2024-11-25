import { ChannelRole, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedUsers(count: number) {
  for (let i = 0; i < count; i++) {
    try {
      await prisma.users.create({
        data: {
          username: faker.internet.userName().slice(0, 50),
          password: faker.internet.password().slice(0, 50),
          email: faker.internet.email(),
          phone: faker.phone.number().slice(0, 20),
          photo: faker.image.avatar().slice(0, 255),
          bio: faker.lorem.sentence().slice(0, 255),
          screenName: faker.name.firstName().slice(0, 50),
          lastSeen: faker.date.recent(),
          activeNow: faker.datatype.boolean(),
          public_key: faker.number.hex().slice(0, 50),
        },
      });
    } catch (err) {
      console.error(`Error seeding user ${i + 1}:`, err);
    }
  }
}

async function seedCommunities(count: number) {
  const users = await prisma.users.findMany();
  for (let i = 0; i < count; i++) {
    try {
      await prisma.communities.create({
        data: {
          name: faker.company.name(),
          privacy: faker.datatype.boolean(),
          creatorId:
            users[faker.number.int({ min: 0, max: users.length - 1 })].id,
        },
      });
    } catch (err) {
      console.error(`Error seeding community ${i + 1}:`, err);
    }
  }
}

async function seedGroups(count: number) {
  const communities = await prisma.communities.findMany();
  for (let i = 0; i < count; i++) {
    try {
      await prisma.groups.create({
        data: {
          communityId: faker.number.int({
            min: 0,
            max: Math.floor((communities.length - 1) / 2),
          }),
          groupSize: faker.number.int({ min: 1, max: 100 }),
          invitationLink: faker.internet.url(),
        },
      });
    } catch (err) {
      console.error(`Error seeding group ${i + 1}:`, err);
    }
  }
}

async function seedChannels(count: number) {
  const communities = await prisma.communities.findMany();
  for (let i = 0; i < count; i++) {
    try {
      await prisma.channels.create({
        data: {
          community_id: faker.number.int({
            min: Math.ceil((communities.length - 1) / 2),
            max: communities.length - 1,
          }),
          canAddComments: faker.datatype.boolean(),
        },
      });
    } catch (err) {
      console.error(`Error seeding channel ${i + 1}:`, err);
    }
  }
}

async function seedStories(count: number) {
  const users = await prisma.users.findMany();
  for (let i = 0; i < count; i++) {
    try {
      await prisma.stories.create({
        data: {
          userId: users[faker.number.int({ min: 0, max: users.length - 1 })].id,
          content: faker.lorem.paragraph(),
          expiryDate: faker.date.soon(),
          createdAt: faker.date.recent(),
        },
      });
    } catch (err) {
      console.error(`Error seeding story ${i + 1}:`, err);
    }
  }
}

async function seedAdmins(count: number) {
  for (let i = 0; i < count; i++) {
    try {
      await prisma.admins.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });
    } catch (err) {
      console.error(`Error seeding admin ${i + 1}:`, err);
    }
  }
}

async function seedAdminGroupFilters(count: number) {
  const admins = await prisma.admins.findMany();
  const groups = await prisma.groups.findMany();
  for (let i = 0; i < count; i++) {
    try {
      await prisma.adminGroupFilters.create({
        data: {
          adminId:
            admins[faker.number.int({ min: 0, max: admins.length - 1 })].id,
          groupId:
            groups[faker.number.int({ min: 0, max: groups.length - 1 })].id,
        },
      });
    } catch (err) {
      console.error(`Error seeding admin group filter ${i + 1}:`, err);
    }
  }
}

async function seedBannedUsers(count: number) {
  const admins = await prisma.admins.findMany();
  const users = await prisma.users.findMany();
  const bannedUsersSet = new Set<string>();

  for (let i = 0; i < count; i++) {
    let adminId: number, userId: number;

    do {
      adminId = admins[faker.number.int({ min: 0, max: admins.length - 1 })].id;
      userId = users[faker.number.int({ min: 0, max: users.length - 1 })].id;
    } while (bannedUsersSet.has(`${adminId}-${userId}`));

    bannedUsersSet.add(`${adminId}-${userId}`);

    try {
      await prisma.bannedUsers.create({
        data: {
          adminId,
          userId,
        },
      });
    } catch (err) {
      console.error(`Error seeding banned user ${i + 1}:`, err);
    }
  }
}

async function seedPersonalChats(count: number) {
  const users = await prisma.users.findMany();
  for (let i = 0; i < count; i++) {
    try {
      let user1, user2;
      do {
        user1 = users[faker.number.int({ min: 0, max: users.length - 1 })].id;
        user2 = users[faker.number.int({ min: 0, max: users.length - 1 })].id;
      } while (user1 === user2);

      await prisma.personalChat.create({
        data: {
          user1Id: user1,
          user2Id: user2,
        },
      });
    } catch (err) {
      console.error(`Error seeding personal chat ${i + 1}:`, err);
    }
  }
}

async function seedParticipants(count: number) {
  const communities = await prisma.communities.findMany();
  const personalChats = await prisma.personalChat.findMany();
  for (let i = 0; i < count; i++) {
    try {
      await prisma.participants.create({
        data: {
          communityId:
            communities[
              faker.number.int({ min: 0, max: communities.length - 1 })
            ].id,
          personalChatId:
            personalChats[
              faker.number.int({ min: 0, max: personalChats.length - 1 })
            ].id,
          type: 'community',
        },
      });
    } catch (err) {
      console.error(`Error seeding participant ${i + 1}:`, err);
    }
  }
}

async function seedCallReceivers(count: number) {
  const groups = await prisma.groups.findMany();
  const personalChats = await prisma.personalChat.findMany();
  for (let i = 0; i < count; i++) {
    try {
      const useGroup = faker.datatype.boolean(); // Randomly decide between group or personal chat
      await prisma.callReceivers.create({
        data: {
          groupId: useGroup
            ? groups[faker.number.int({ min: 0, max: groups.length - 1 })].id
            : null,
          personalChatId: !useGroup
            ? personalChats[
                faker.number.int({ min: 0, max: personalChats.length - 1 })
              ].id
            : null,
        },
      });
    } catch (err) {
      console.error(`Error seeding call receiver ${i + 1}:`, err);
    }
  }
}

async function seedStoryViews(count: number) {
  const users = await prisma.users.findMany();
  const stories = await prisma.stories.findMany();

  for (let i = 0; i < count; i++) {
    try {
      const userId =
        users[faker.number.int({ min: 0, max: users.length - 1 })].id;
      const storyId =
        stories[faker.number.int({ min: 0, max: stories.length - 1 })].id;

      // Ensure that a user does not view the same story multiple times
      const existingView = await prisma.storyViews.findUnique({
        where: {
          userId_storyId: {
            userId,
            storyId,
          },
        },
      });

      if (!existingView) {
        await prisma.storyViews.create({
          data: {
            userId,
            storyId,
          },
        });
      }
    } catch (err) {
      console.error(`Error seeding story view ${i + 1}:`, err);
    }
  }
}

async function seedUserBlacklist(count: number) {
  const users = await prisma.users.findMany();

  for (let i = 0; i < count; i++) {
    try {
      let blockerId, blockedId;

      // Ensure blocker and blocked users are different
      do {
        blockerId =
          users[faker.number.int({ min: 0, max: users.length - 1 })].id;
        blockedId =
          users[faker.number.int({ min: 0, max: users.length - 1 })].id;
      } while (blockerId === blockedId); // Ensure blocker and blocked users are not the same

      // Ensure that the block relationship doesn't already exist
      const existingBlock = await prisma.userBlacklist.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId,
          },
        },
      });

      if (!existingBlock) {
        await prisma.userBlacklist.create({
          data: {
            blockerId,
            blockedId,
          },
        });
      }
    } catch (err) {
      console.error(`Error seeding UserBlacklist ${i + 1}:`, err);
    }
  }
}

async function seedVoiceCalls(count: number) {
  const users = await prisma.users.findMany();
  const callReceivers = await prisma.callReceivers.findMany();

  for (let i = 0; i < count; i++) {
    try {
      const creatorId =
        users[faker.number.int({ min: 0, max: users.length - 1 })].id;
      const callReceiverId =
        callReceivers[
          faker.number.int({ min: 0, max: callReceivers.length - 1 })
        ].id;
      const numberOfParticipants = faker.number.int({ min: 2, max: 10 }); // Random number of participants (between 2 and 10)
      const startAt = faker.date.past(); // Random past start time
      const endAt = faker.date.between({ from: startAt, to: new Date() });

      await prisma.voiceCalls.create({
        data: {
          creatorId,
          callReceiverId,
          numberOfParticipants,
          startAt,
          endAt,
        },
      });
    } catch (err) {
      console.error(`Error seeding VoiceCall ${i + 1}:`, err);
    }
  }
}

async function seedChannelSubscriptions(count: number) {
  const users = await prisma.users.findMany();
  const channels = await prisma.channels.findMany();

  const roles: ChannelRole[] = ['admin', 'member'];

  for (let i = 0; i < count; i++) {
    try {
      const userId =
        users[faker.number.int({ min: 0, max: users.length - 1 })].id;
      const channelId =
        channels[faker.number.int({ min: 0, max: channels.length - 1 })].id;
      const hasDownloadPermissions = faker.datatype.boolean(); // Random download permission
      const role: ChannelRole =
        roles[faker.number.int({ min: 0, max: roles.length - 1 })];
      const status = faker.datatype.boolean(); // Random status (active or inactive)

      await prisma.channelSubscriptions.create({
        data: {
          userId,
          channelId,
          hasDownloadPermissions,
          role,
          status,
        },
      });
    } catch (err) {
      console.error(`Error seeding ChannelSubscription ${i + 1}:`, err);
    }
  }
}

async function seedGroupMemberships(count: number) {
  const users = await prisma.users.findMany();
  const groups = await prisma.groups.findMany();

  // Define possible roles for group memberships
  const roles = ['admin', 'member', 'moderator']; // Adjust as needed

  for (let i = 0; i < count; i++) {
    try {
      const userId =
        users[faker.number.int({ min: 0, max: users.length - 1 })].id;
      const groupId =
        groups[faker.number.int({ min: 0, max: groups.length - 1 })].id;
      const role = roles[faker.number.int({ min: 0, max: roles.length - 1 })]; // Random role
      const hasDownloadPermissions = faker.datatype.boolean(); // Random download permission
      const hasMessagePermissions = faker.datatype.boolean(); // Random message permission
      const addToGroupPermission = faker.datatype.boolean(); // Random add-to-group permission
      const status = faker.datatype.boolean(); // Random status (active or inactive)

      const groupMembership = await prisma.groupMemberships.create({
        data: {
          userId,
          groupId,
          role,
          hasDownloadPermissions,
          hasMessagePermissions,
          addToGroupPermission,
          status,
        },
      });
    } catch (err) {
      console.error(`Error seeding GroupMembership ${i + 1}:`, err);
    }
  }
}

async function seedMedia(count: number) {
  const stories = await prisma.stories.findMany(); // Fetch stories to associate with media

  // Define possible media types
  const mediaTypes = ['image', 'video', 'audio', 'document'];

  for (let i = 0; i < count; i++) {
    try {
      const mediaType =
        mediaTypes[faker.number.int({ min: 0, max: mediaTypes.length - 1 })]; // Random media type
      const mediaUrl = faker.internet.url(); // Random media URL

      // Create the Media entry
      await prisma.media.create({
        data: {
          mediaType,
          mediaUrl,
        },
      });
    } catch (err) {
      console.error(`Error seeding Media ${i + 1}:`, err);
    }
  }
}

async function seedStoryMedia(count: number) {
  const stories = await prisma.stories.findMany();
  const media = await prisma.media.findMany();

  for (let i = 0; i < count; i++) {
    try {
      const storyId =
        stories[faker.number.int({ min: 0, max: stories.length - 1 })].id;
      const mediaId =
        media[faker.number.int({ min: 0, max: media.length - 1 })].id;

      // Ensure that the combination of storyId and mediaId doesn't already exist
      const existingStoryMedia = await prisma.storyMedia.findUnique({
        where: {
          storyId_mediaId: {
            storyId,
            mediaId,
          },
        },
      });

      if (!existingStoryMedia) {
        await prisma.storyMedia.create({
          data: {
            storyId,
            mediaId,
          },
        });
      }
    } catch (err) {
      console.error(`Error seeding StoryMedia ${i + 1}:`, err);
    }
  }
}

async function seedMutedParticipants(count: number) {
  const users = await prisma.users.findMany(); // Fetch users from the database
  const participants = await prisma.participants.findMany(); // Fetch participants from the database

  for (let i = 0; i < count; i++) {
    try {
      // Select random user and participant
      const userId =
        users[faker.number.int({ min: 0, max: users.length - 1 })].id;
      const participantId =
        participants[faker.number.int({ min: 0, max: participants.length - 1 })]
          .id;

      // Generate a random mute duration (e.g., between 1 and 7 days)
      const duration = `P${faker.number.int({ min: 1, max: 7 })}D`; // Duration in ISO 8601 format (e.g., P3D for 3 days)

      // Create a MutedParticipants entry
      await prisma.mutedParticipants.create({
        data: {
          userId,
          participantId,
          //duration,
        },
      });
    } catch (err) {
      console.error(`Error seeding MutedParticipants ${i + 1}:`, err);
    }
  }
}

async function seedMessages(count: number) {
  const users = await prisma.users.findMany(); // Fetch users from the database
  const participants = await prisma.participants.findMany(); // Fetch participants from the database
  const messages = await prisma.messages.findMany(); // Fetch existing messages to handle replies

  for (let i = 0; i < count; i++) {
    try {
      // Select random user and participant
      const senderId =
        users[faker.number.int({ min: 0, max: users.length - 1 })].id;
      const participantId =
        participants[faker.number.int({ min: 0, max: participants.length - 1 })]
          .id;

      // Select whether the message is a reply (randomly choose a message)
      const replyTo = faker.datatype.boolean()
        ? messages[faker.number.int({ min: 0, max: messages.length - 1 })]?.id
        : null;

      // Generate random duration in minutes (optional)
      const durationInMinutes = faker.number.int({ min: 1, max: 120 });

      // Randomly assign announcement and forward flags
      const isAnnouncement = faker.datatype.boolean();
      const isForward = faker.datatype.boolean();

      // Generate random content and URL (optional)
      const content = faker.lorem.sentence();
      const url = faker.datatype.boolean() ? faker.internet.url() : null;

      // Create a Message entry
      await prisma.messages.create({
        data: {
          senderId,
          participantId,
          replyTo,
          durationInMinutes,
          isAnnouncement,
          isForward,
          content,
          url,
          status: 'usual', // Or can be randomized as well (e.g., 'read', 'delivered')
        },
      });
    } catch (err) {
      console.error(`Error seeding Message ${i + 1}:`, err);
    }
  }
}

async function seedMessageReadReceipts(count: number) {
  const users = await prisma.users.findMany(); // Fetch users from the database
  const messages = await prisma.messages.findMany(); // Fetch messages from the database
  const participants = await prisma.participants.findMany(); // Fetch participants from the database

  for (let i = 0; i < count; i++) {
    try {
      // Select random user, message, and participant (optional)
      const userId =
        users[faker.number.int({ min: 0, max: users.length - 1 })].id;
      const messageId =
        messages[faker.number.int({ min: 0, max: messages.length - 1 })].id;
      const participantId = faker.datatype.boolean()
        ? participants[
            faker.number.int({ min: 0, max: participants.length - 1 })
          ]?.id
        : null;

      // Generate random timestamps for deliveredAt and readAt (if the message is read)
      const deliveredAt = faker.date.recent();
      const readAt = faker.datatype.boolean()
        ? faker.date.recent({ refDate: deliveredAt })
        : null;

      // Create a MessageReadReceipt entry
      await prisma.messageReadReceipts.create({
        data: {
          userId,
          messageId,
          deliveredAt,
          readAt,
          participantId,
        },
      });
    } catch (err) {
      console.error(`Error seeding MessageReadReceipt ${i + 1}:`, err);
    }
  }
}

async function seedMessageMentions(count: number) {
  const users = await prisma.users.findMany(); // Fetch users from the database
  const messages = await prisma.messages.findMany(); // Fetch messages from the database

  for (let i = 0; i < count; i++) {
    try {
      // Randomly select a message
      const messageId =
        messages[faker.number.int({ min: 0, max: messages.length - 1 })].id;

      // Randomly select users to mention (excluding the sender)
      const senderId = messages.find((msg) => msg.id === messageId)?.senderId;
      const mentionedUser = users.filter((user) => user.id !== senderId);

      // Pick a random number of mentions (1 to 3 mentions per message)
      const numberOfMentions = faker.number.int({ min: 1, max: 3 });

      for (let j = 0; j < numberOfMentions; j++) {
        const randomMentionedUser =
          mentionedUser[
            faker.number.int({ min: 0, max: mentionedUser.length - 1 })
          ];

        // Create a MessageMention entry
        await prisma.messageMentions.create({
          data: {
            userId: randomMentionedUser.id,
            messageId: messageId,
          },
        });
      }
    } catch (err) {
      console.error(`Error seeding MessageMentions ${i + 1}:`, err);
    }
  }
}

async function seed() {
  try {
    console.log('Starting data seeding...');
    await seedUsers(20);
    await seedCommunities(20);
    await seedGroups(5);
    await seedChannels(5);
    await seedStories(5);
    await seedAdmins(5);
    await seedAdminGroupFilters(3);
    await seedBannedUsers(10);
    await seedPersonalChats(10);
    await seedParticipants(10);
    await seedCallReceivers(10);
    await seedStoryViews(20);
    await seedStoryMedia(15);
    await seedUserBlacklist(10);
    await seedVoiceCalls(10);
    await seedChannelSubscriptions(10);
    await seedGroupMemberships(10);
    await seedMedia(10);
    await seedMutedParticipants(10);
    await seedMessages(50);
    await seedMessageReadReceipts(20);
    await seedMessageMentions(20);
    console.log('Seeding completed!');
  } catch (err) {
    console.error('Unexpected error during seeding:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
