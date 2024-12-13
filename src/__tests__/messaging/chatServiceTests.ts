const prisma = {
  messages: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  participants: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => prisma),
}));

const getFileFromFirebase = jest.fn();

import { getMessagesService, canSeeMessages } from '../../services';

jest.mock('firebase-admin', () => {
  const actualAdmin = jest.requireActual('firebase-admin');
  return {
    ...actualAdmin,
    initializeApp: jest.fn(),
  };
});
jest.mock('../../server.ts', () => ({}));
const serviceAccount = {
  type: 'service_account',
  project_id: 'your-project-id',
  private_key_id: 'your-private-key-id',
  private_key: 'your-private-key',
  client_email: 'your-client-email',
  client_id: 'your-client-id',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://accounts.google.com/o/oauth2/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/your-client-email',
};

jest.mock('../../config/firebase', () => ({
  __esModule: true,
  default: {
    storage: {
      ref: jest.fn().mockReturnValue({
        getDownloadURL: jest.fn().mockResolvedValue('file content'),
      }),
    },
  },
}));

describe('getMessagesService', () => {
  it('should return messages with correct details', async () => {
    // Mock data
    const participantId = 1;
    const senderId = 2;
    const take = 10;
    const skip = 0;

    const mockMessages = [
      { senderId: 3, content: 'Hello', url: 'path/to/file' },
      {
        senderId: 2,
        content: 'Draft message',
        status: 'drafted',
        url: 'path/to/file',
      },
    ];

    prisma.messages.findMany.mockResolvedValue(mockMessages);
    getFileFromFirebase.mockResolvedValue('file content');

    const messages = await getMessagesService(
      participantId,
      senderId,
      take,
      skip
    );

    expect(messages.length).toBe(2);
    expect(messages[0].messageMentions).toEqual([]);
    expect(messages[0].messageReadReceipts).toEqual([]);
    expect(messages[1].content).toBe('file content');
  });

  it('should return only drafted message when no other messages exist', async () => {
    // Mock data
    const participantId = 1;
    const senderId = 2;
    const take = 10;
    const skip = 0;

    prisma.messages.findMany.mockResolvedValue([]);
    prisma.messages.findFirst.mockResolvedValue({
      participantId,
      senderId,
      status: 'drafted',
      content: '',
      url: 'path/to/draft-file',
    });
    getFileFromFirebase.mockResolvedValue('draft file content');

    const messages = await getMessagesService(
      participantId,
      senderId,
      take,
      skip
    );

    expect(messages.length).toBe(1);
    expect(messages[0].content).toBe('draft file content');
  });
});

describe('canSeeMessages', () => {
  it('should return true if user is a member of the chat or community', async () => {
    // Mock data
    const userId = 1;
    const participantId = 1;

    prisma.participants.findMany.mockResolvedValue([
      { id: participantId, personalChat: { user1Id: 1 } },
    ]);

    const canSee = await canSeeMessages(userId, participantId);

    expect(canSee).toBe(true);
  });

  it('should return false if user is not a member of the chat or community', async () => {
    // Mock data
    const userId = 1;
    const participantId = 2;

    prisma.participants.findMany.mockResolvedValue([]);

    const canSee = await canSeeMessages(userId, participantId);

    expect(canSee).toBe(false);
  });
});
