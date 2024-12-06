import { io, server } from '../server';
import { Chat } from '../sockets/chat';
import {
  handleDeleteMessage,
  handleEditMessage,
  handleNewMessage,
  handleOpenContext,
  NewMessages,
} from '../sockets/listeners/chatListeners';
import {
  createMessage,
  createPersonalChat,
  deleteMessage,
  getMessageById,
  insertMessageRecipient,
  markMessagesAsRead,
  updateMessageById,
} from '../services';
import {
  deleteFileFromFirebase,
  uploadFileToFirebase,
} from '../third_party_services';
import logger from '../utility/logger';
import { MessageStatus } from '@prisma/client';

jest.mock('../utility/logger');
jest.mock('../config/firebase');
jest.mock('../sockets/chat');
jest.mock('../third_party_services/Firebase');
jest.mock('../services/chatService');
const mockEmit = jest.fn();
jest.mock('../server', () => ({
  io: {
    sockets: {
      adapter: { rooms: { get: jest.fn() } },
    },
    to: jest.fn(() => ({
      emit: mockEmit,
    })),
  },

  server: { close: jest.fn() }, // Mock close to prevent interference
}));

describe('New Message Handling Function', () => {
  let mockSocket: any;
  let callbackMock: jest.Mock;
  jest.mock('../sockets/listeners/chatListeners', () => {
    const actual = jest.requireActual('../sockets/listeners/chatListeners');
    return {
      ...actual,
      handleDeleteMessage: jest.fn(),
    };
  });
  beforeEach(() => {
    jest.clearAllMocks();

    mockSocket = {
      user: { id: 1 },
      broadcast: {
        to: jest.fn(() => ({
          emit: jest.fn(),
        })),
      },
      emit: jest.fn(),
    };

    callbackMock = jest.fn();
    // io.sockets.adapter.rooms = {
    //   get: jest.fn(),
    // };

    Chat.getInstance = jest.fn().mockReturnValue({
      getUserUsingSocketId: jest.fn(),
    });
  });

  it('should return an error when status is "drafted"', async () => {
    const message = { status: 'drafted', content: 'Test' } as NewMessages;

    await handleNewMessage(mockSocket, callbackMock, message);

    expect(callbackMock).toHaveBeenCalledWith({
      message:
        "you can't save a new message as drafted you are allowed to update the drafted messages only",
    });
    expect(createMessage).not.toHaveBeenCalled();
  });

  it('should return an error when content is empty', async () => {
    const message = { status: 'pinned', content: '' } as NewMessages;
    await handleNewMessage(mockSocket, callbackMock, message);
    expect(callbackMock).toHaveBeenCalledWith({ message: 'message is empty' });
    expect(createMessage).not.toHaveBeenCalled();
  });

  it('should create a personal chat when receiverId is provided', async () => {
    const message = { receiverId: 2, content: 'Hello' } as NewMessages;
    const mockChat = { participants: { id: 123 } };
    (createPersonalChat as jest.Mock).mockResolvedValueOnce(mockChat);

    await handleNewMessage(mockSocket, callbackMock, message);

    expect(createPersonalChat).toHaveBeenCalledWith(2, 1);
    expect(message.participantId).toBe(123);
  });

  it('should upload long messages to Firebase and update the URL', async () => {
    const message = { content: 'a'.repeat(300) } as NewMessages;
    const mockMessage = { id: 1 };
    (createMessage as jest.Mock).mockResolvedValueOnce(mockMessage);
    (uploadFileToFirebase as jest.Mock).mockResolvedValueOnce('mock-url');

    await handleNewMessage(mockSocket, callbackMock, message);

    expect(uploadFileToFirebase).toHaveBeenCalledWith(message.content);
    expect(updateMessageById).toHaveBeenCalledWith(1, { url: 'mock-url' });
  });

  it('should update the message content if it is short', async () => {
    const message = { content: 'Short message' } as NewMessages;
    const mockMessage = { id: 1 };
    (createMessage as jest.Mock).mockResolvedValueOnce(mockMessage);

    await handleNewMessage(mockSocket, callbackMock, message);

    expect(updateMessageById).toHaveBeenCalledWith(1, {
      content: 'Short message',
    });
  });

  it('should set up a timeout to delete the message after duration', async () => {
    jest.spyOn(global, 'setTimeout');
    const message = {
      durationInMinutes: 1,
      content: 'Test',
      participantId: 1,
    } as NewMessages;
    const mockMessage = { id: 1 };
    (createMessage as jest.Mock).mockResolvedValueOnce(mockMessage);
    await handleNewMessage(mockSocket, callbackMock, message);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 60 * 1000);
  });
});

describe('handleOpenContext', () => {
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSocket = {
      user: { id: 1 },
      broadcast: {
        to: jest.fn(() => ({
          emit: jest.fn(),
        })),
      },
      emit: jest.fn(),
    };
  });

  it('should mark messages as read and emit updated info', async () => {
    const data = { participantId: 2 };
    const mockUpdatedMessages = [
      { messages: { senderId: 3 }, content: 'Hello' },
      { messages: { senderId: 4 }, content: 'Hi' },
    ];
    (markMessagesAsRead as jest.Mock).mockResolvedValueOnce(
      mockUpdatedMessages
    );

    // Call the function
    await handleOpenContext(mockSocket, undefined, data);

    // Verify that messages were marked as read
    expect(markMessagesAsRead).toHaveBeenCalledWith(1, 2);

    // Verify that the appropriate events were emitted
    expect(io.to).toHaveBeenCalledWith('3');
    expect(io.to).toHaveBeenCalledWith('4');
    expect(io.to('3').emit).toHaveBeenCalledWith('message:update-info', {
      messages: undefined,
      content: 'Hello',
    });
    expect(io.to('4').emit).toHaveBeenCalledWith('message:update-info', {
      messages: undefined,
      content: 'Hi',
    });
  });
});
describe('handleDeleteMessage', () => {
  let mockSocket: any;
  let callbackMock: jest.Mock;

  const mockEmit = jest.fn();
  const mockMessage = {
    id: 1,
    senderId: 1,
    participantId: 3,
    url: 'mock-url',
  } as NewMessages;

  const setupMocks = (message: NewMessages) => {
    (getMessageById as jest.Mock).mockResolvedValueOnce(message);
    (deleteFileFromFirebase as jest.Mock).mockResolvedValueOnce(undefined);
    (deleteMessage as jest.Mock).mockResolvedValueOnce(undefined);
    (io.to as jest.Mock).mockReturnValueOnce({ emit: mockEmit });
    callbackMock.mockReset();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket = { user: { id: 1 } };
    callbackMock = jest.fn();
  });

  it('should call callback with error if message is not found', async () => {
    setupMocks(null);
    await handleDeleteMessage(mockSocket, callbackMock, { id: 1 });
    expect(callbackMock).toHaveBeenCalledWith({
      message: 'message is not found',
    });
    expect(deleteFileFromFirebase).not.toHaveBeenCalled();
    expect(deleteMessage).not.toHaveBeenCalled();
  });

  it('should call callback with error if user is not the sender of the message', async () => {
    const invalidMessage = { ...mockMessage, senderId: 2 } as NewMessages;
    setupMocks(invalidMessage);
    await handleDeleteMessage(mockSocket, callbackMock, { id: 1 });
    expect(callbackMock).toHaveBeenCalledWith({
      message: 'message is not found',
    });
    expect(deleteFileFromFirebase).not.toHaveBeenCalled();
    expect(deleteMessage).not.toHaveBeenCalled();
  });

  it('should delete the message and notify the participant when valid message', async () => {
    setupMocks(mockMessage);
    await handleDeleteMessage(mockSocket, callbackMock, { id: 1 });
    expect(deleteFileFromFirebase).toHaveBeenCalledWith(mockMessage.url);
    expect(deleteMessage).toHaveBeenCalledWith(mockMessage.id);
    expect(io.to).toHaveBeenCalledWith('3');
    expect(mockEmit).toHaveBeenCalledWith('message:deleted', {
      message: { id: 1, participantId: 3 },
    });
    expect(callbackMock).not.toHaveBeenCalled();
  });

  it('should not call deleteFileFromFirebase if message has no URL', async () => {
    const messageWithoutUrl = { ...mockMessage, url: null } as NewMessages;
    setupMocks(messageWithoutUrl);

    await handleDeleteMessage(mockSocket, callbackMock, { id: 1 });

    expect(deleteFileFromFirebase).not.toHaveBeenCalled();
    expect(deleteMessage).toHaveBeenCalledWith(messageWithoutUrl.id);
    expect(io.to).toHaveBeenCalledWith('3');
    expect(mockEmit).toHaveBeenCalledWith('message:deleted', {
      message: { id: 1, participantId: 3 },
    });
    expect(callbackMock).not.toHaveBeenCalled();
  });

  it('should log the message deletion', async () => {
    setupMocks(mockMessage);
    await handleDeleteMessage(mockSocket, callbackMock, { id: 1 });
    expect(logger.info).toHaveBeenCalledWith('deleted message', mockMessage);
  });
});

describe('handleEditMessage', () => {
  let mockSocket: any;
  let callbackMock: jest.Mock;
  const mockEmit = jest.fn();
  const mockMessage = {
    id: 1,
    senderId: 1,
    participantId: 2,
    content: 'Old content',
    url: 'mock-url',
    status: MessageStatus.usual,
  } as NewMessages;

  const setupMocks = (
    message: NewMessages,
    editedMessage?: { content: string; url?: string }
  ) => {
    (getMessageById as jest.Mock).mockResolvedValueOnce(message);
    (deleteFileFromFirebase as jest.Mock).mockResolvedValueOnce(undefined);
    (uploadFileToFirebase as jest.Mock).mockResolvedValueOnce('new-file-url');
    (updateMessageById as jest.Mock).mockResolvedValueOnce({
      ...message,
      content: (editedMessage || message || {}).content,
      url: (editedMessage || message || {}).url,
    });
    (io.to as jest.Mock).mockReturnValueOnce({ emit: mockEmit });
    callbackMock.mockReset();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket = { user: { id: 1 } };
    callbackMock = jest.fn();
    (io.to as jest.Mock).mockReturnValueOnce({ emit: mockEmit });
  });

  it('should call callback with error if message is not found', async () => {
    setupMocks(null);
    await handleEditMessage(mockSocket, callbackMock, {
      id: 1,
      content: 'New content',
    });

    expect(callbackMock).toHaveBeenCalledWith({
      message: 'message is not found',
    });
    expect(deleteFileFromFirebase).not.toHaveBeenCalled();
    expect(uploadFileToFirebase).not.toHaveBeenCalled();
    expect(updateMessageById).not.toHaveBeenCalled();
  });

  it('should call callback with error if user is not the sender of the message', async () => {
    const invalidMessage = { ...mockMessage, senderId: 2 } as NewMessages;
    setupMocks(invalidMessage);

    await handleEditMessage(mockSocket, callbackMock, {
      id: 1,
      content: 'New content',
    });

    expect(callbackMock).toHaveBeenCalledWith({
      message: 'message is not found',
    });
    expect(deleteFileFromFirebase).not.toHaveBeenCalled();
    expect(uploadFileToFirebase).not.toHaveBeenCalled();
    expect(updateMessageById).not.toHaveBeenCalled();
  });

  it('should edit the message and handle content update', async () => {
    const newContent = 'New content';
    setupMocks({ ...mockMessage, url: undefined }, { content: newContent });

    await handleEditMessage(mockSocket, callbackMock, {
      id: 1,
      content: newContent,
    });

    expect(updateMessageById).toHaveBeenCalledWith(1, {
      content: newContent,
      url: null,
    });

    expect(deleteFileFromFirebase).not.toHaveBeenCalled();
    expect(uploadFileToFirebase).not.toHaveBeenCalled();
    expect(io.to).toHaveBeenCalledWith('2');
    expect(mockEmit).toHaveBeenCalledWith(
      'message:edited',
      expect.objectContaining({ content: newContent })
    );
    expect(callbackMock).not.toHaveBeenCalled();
  });

  it('should handle file upload for content longer than 100 characters', async () => {
    const longContent = 'A'.repeat(101); // Length > 100
    setupMocks(mockMessage, { content: null, url: 'new-file-url' });

    await handleEditMessage(mockSocket, callbackMock, {
      id: 1,
      content: longContent,
    });

    expect(deleteFileFromFirebase).toHaveBeenCalledWith(mockMessage.url);
    expect(uploadFileToFirebase).toHaveBeenCalledWith(longContent);
    expect(updateMessageById).toHaveBeenCalledWith(1, {
      content: null, // content is null as it's being replaced with the file URL
      url: 'new-file-url',
    });
    expect(io.to).toHaveBeenCalledWith('2');
    expect(mockEmit).toHaveBeenCalledWith(
      'message:edited',
      expect.objectContaining({ url: 'new-file-url' })
    );
    expect(callbackMock).not.toHaveBeenCalled();
  });

  it('should handle no file upload if content is shorter than 100 characters', async () => {
    const shortContent = 'Short content';
    setupMocks(mockMessage, { content: shortContent });

    await handleEditMessage(mockSocket, callbackMock, {
      id: 1,
      content: shortContent,
    });

    expect(uploadFileToFirebase).not.toHaveBeenCalled();
    expect(updateMessageById).toHaveBeenCalledWith(1, {
      content: shortContent,
      url: null,
    });
    expect(io.to).toHaveBeenCalledWith('2');
    expect(mockEmit).toHaveBeenCalledWith(
      'message:edited',
      expect.objectContaining({ content: shortContent })
    );
    expect(callbackMock).not.toHaveBeenCalled();
  });

  it('should not upload file if there is no content to change', async () => {
    const unchangedMessage = { ...mockMessage, content: '' };
    setupMocks(unchangedMessage);

    await handleEditMessage(mockSocket, callbackMock, { id: 1, content: '' });

    expect(deleteFileFromFirebase).not.toHaveBeenCalled();
    expect(uploadFileToFirebase).not.toHaveBeenCalled();
    expect(callbackMock).toHaveBeenCalled();
  });

  it('should emit to the sender if the message status is "drafted"', async () => {
    const draftedMessage = {
      ...mockMessage,
      status: MessageStatus.drafted,
    } as NewMessages;
    setupMocks(draftedMessage, { content: 'New draft content' });

    await handleEditMessage(mockSocket, callbackMock, {
      id: 1,
      content: 'New draft content',
    });

    expect(io.to).toHaveBeenCalledWith('1'); // Emit to sender
    expect(mockEmit).toHaveBeenCalledWith(
      'message:edited',
      expect.objectContaining({ content: 'New draft content' })
    );
  });

  it('should log the message editing process', async () => {
    setupMocks(mockMessage);
    await handleEditMessage(mockSocket, callbackMock, {
      id: 1,
      content: 'New content',
    });
    expect(logger.info).toHaveBeenCalledWith(
      'message with id 1 is being edited'
    );
  });
});
