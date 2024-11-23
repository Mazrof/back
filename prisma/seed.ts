import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Starting data seeding...');

    const users = [];
    try {
      // Seed Users
      for (let i = 0; i < 20; i++) {
        const user = await prisma.users.create({
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
        users.push(user);
      }
    } catch (err) {
      console.error('Error seeding users:', err);
    }

    const communities = [];
    try {
      // Seed Communities
      for (let i = 0; i < 5; i++) {
        const community = await prisma.communities.create({
          data: {
            name: faker.company.name(),
            privacy: faker.datatype.boolean(),
            creatorId:
              users[faker.number.int({ min: 0, max: users.length - 1 })].id,
          },
        });
        communities.push(community);
      }
    } catch (err) {
      console.error('Error seeding communities:', err);
    }

    const groups = [];
    try {
      // Seed Groups
      for (let i = 0; i < 10; i++) {
        const group = await prisma.groups.create({
          data: {
            communityId: faker.datatype.boolean()
              ? communities[
                  faker.number.int({ min: 0, max: communities.length - 1 })
                ].id
              : null,
            groupSize: faker.number.int({ min: 1, max: 100 }),
            status: faker.datatype.boolean(),
            invitationLink: faker.internet.url(),
          },
        });
        groups.push(group);
      }
    } catch (err) {
      console.error('Error seeding groups:', err);
    }

    try {
      // Seed Stories
      for (let i = 0; i < 20; i++) {
        await prisma.stories.create({
          data: {
            userId:
              users[faker.number.int({ min: 0, max: users.length - 1 })].id,
            content: faker.lorem.paragraph(),
            expiryDate: faker.date.soon(),
            createdAt: faker.date.recent(),
          },
        });
      }
    } catch (err) {
      console.error('Error seeding stories:', err);
    }

    const participants = [];
    try {
      // Seed Participants
      for (let i = 0; i < 20; i++) {
        const participant = await prisma.participants.create({
          data: {
            communityId:
              communities[
                faker.number.int({ min: 0, max: communities.length - 1 })
              ].id,
            personalChatId: null,
            type: 'community',
          },
        });
        participants.push(participant);
      }
    } catch (err) {
      console.error('Error seeding participants:', err);
    }

    const messages = [];
    try {
      // Seed Messages
      for (let i = 0; i < 20; i++) {
        const message = await prisma.messages.create({
          data: {
            content: faker.lorem.sentence(),
            senderId:
              users[faker.number.int({ min: 0, max: users.length - 1 })].id,
            participantId:
              participants[
                faker.number.int({ min: 0, max: participants.length - 1 })
              ].id,
            status: 'usual',
          },
        });
        messages.push(message);
      }
    } catch (err) {
      console.error('Error seeding messages:', err);
    }

    const admins = [];
    try {
      // Seed Admins
      for (let i = 0; i < 5; i++) {
        const admin = await prisma.admins.create({
          data: {
            email: faker.internet.email(),
            password: faker.internet.password(),
          },
        });
        admins.push(admin);
      }
    } catch (err) {
      console.error('Error seeding admins:', err);
    }

    try {
      // Seed Admin Group Filters
      for (let i = 0; i < 3; i++) {
        await prisma.adminGroupFilters.create({
          data: {
            adminId:
              admins[faker.number.int({ min: 0, max: admins.length - 1 })].id,
            groupId:
              groups[faker.number.int({ min: 0, max: groups.length - 1 })].id,
          },
        });
      }
    } catch (err) {
      console.error('Error seeding admin group filters:', err);
    }

    console.log('Seeding completed!');
  } catch (err) {
    console.error('Unexpected error during seeding:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
