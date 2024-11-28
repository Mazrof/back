"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const prisma = new client_1.PrismaClient();
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Starting data seeding...');
            const users = [];
            try {
                // Seed Users
                for (let i = 0; i < 20; i++) {
                    const user = yield prisma.users.create({
                        data: {
                            username: faker_1.faker.internet.userName().slice(0, 50),
                            password: faker_1.faker.internet.password().slice(0, 50),
                            email: faker_1.faker.internet.email(),
                            phone: faker_1.faker.phone.number().slice(0, 20),
                            photo: faker_1.faker.image.avatar().slice(0, 255),
                            bio: faker_1.faker.lorem.sentence().slice(0, 255),
                            screenName: faker_1.faker.name.firstName().slice(0, 50),
                            lastSeen: faker_1.faker.date.recent(),
                            activeNow: faker_1.faker.datatype.boolean(),
                            public_key: faker_1.faker.number.hex().slice(0, 50),
                        },
                    });
                    users.push(user);
                }
            }
            catch (err) {
                console.error('Error seeding users:', err);
            }
            const communities = [];
            try {
                // Seed Communities
                for (let i = 0; i < 5; i++) {
                    const community = yield prisma.communities.create({
                        data: {
                            name: faker_1.faker.company.name(),
                            privacy: faker_1.faker.datatype.boolean(),
                            creatorId: users[faker_1.faker.number.int({ min: 0, max: users.length - 1 })].id,
                        },
                    });
                    communities.push(community);
                }
            }
            catch (err) {
                console.error('Error seeding communities:', err);
            }
            const groups = [];
            try {
                // Seed Groups
                for (let i = 0; i < 10; i++) {
                    const group = yield prisma.groups.create({
                        data: {
                            communityId: faker_1.faker.datatype.boolean()
                                ? communities[faker_1.faker.number.int({ min: 0, max: communities.length - 1 })].id
                                : null,
                            groupSize: faker_1.faker.number.int({ min: 1, max: 100 }),
                            status: faker_1.faker.datatype.boolean(),
                            invitationLink: faker_1.faker.internet.url(),
                        },
                    });
                    groups.push(group);
                }
            }
            catch (err) {
                console.error('Error seeding groups:', err);
            }
            try {
                // Seed Stories
                for (let i = 0; i < 20; i++) {
                    yield prisma.stories.create({
                        data: {
                            userId: users[faker_1.faker.number.int({ min: 0, max: users.length - 1 })].id,
                            content: faker_1.faker.lorem.paragraph(),
                            expiryDate: faker_1.faker.date.soon(),
                            createdAt: faker_1.faker.date.recent(),
                        },
                    });
                }
            }
            catch (err) {
                console.error('Error seeding stories:', err);
            }
            const participants = [];
            try {
                // Seed Participants
                for (let i = 0; i < 20; i++) {
                    const participant = yield prisma.participants.create({
                        data: {
                            communityId: communities[faker_1.faker.number.int({ min: 0, max: communities.length - 1 })].id,
                            personalChatId: null,
                            type: 'community',
                        },
                    });
                    participants.push(participant);
                }
            }
            catch (err) {
                console.error('Error seeding participants:', err);
            }
            const messages = [];
            try {
                // Seed Messages
                for (let i = 0; i < 20; i++) {
                    const message = yield prisma.messages.create({
                        data: {
                            content: faker_1.faker.lorem.sentence(),
                            senderId: users[faker_1.faker.number.int({ min: 0, max: users.length - 1 })].id,
                            participantId: participants[faker_1.faker.number.int({ min: 0, max: participants.length - 1 })].id,
                            status: 'usual',
                        },
                    });
                    messages.push(message);
                }
            }
            catch (err) {
                console.error('Error seeding messages:', err);
            }
            const admins = [];
            try {
                // Seed Admins
                for (let i = 0; i < 5; i++) {
                    const admin = yield prisma.admins.create({
                        data: {
                            email: faker_1.faker.internet.email(),
                            password: faker_1.faker.internet.password(),
                        },
                    });
                    admins.push(admin);
                }
            }
            catch (err) {
                console.error('Error seeding admins:', err);
            }
            try {
                // Seed Admin Group Filters
                for (let i = 0; i < 3; i++) {
                    yield prisma.adminGroupFilters.create({
                        data: {
                            adminId: admins[faker_1.faker.number.int({ min: 0, max: admins.length - 1 })].id,
                            groupId: groups[faker_1.faker.number.int({ min: 0, max: groups.length - 1 })].id,
                        },
                    });
                }
            }
            catch (err) {
                console.error('Error seeding admin group filters:', err);
            }
            console.log('Seeding completed!');
        }
        catch (err) {
            console.error('Unexpected error during seeding:', err);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
seed();
