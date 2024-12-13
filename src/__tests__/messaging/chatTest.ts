import { DefaultEventsMap } from 'socket.io';
import { Server, Socket } from 'socket.io';
import {
  disconnectedHandler,
  setupSocketEventHandlers,
} from '../../sockets/listeners/chatListeners';
import logger from '../../utility/logger';
import { updateUserById } from '../../repositories/userRepository';
import { Chat } from '../../sockets/chat';

const mockSocket: Partial<Socket<DefaultEventsMap, DefaultEventsMap>> = {
  on: jest.fn(),
  emit: jest.fn(),
};
jest.mock('../../server', () => ({ io: jest.fn() }));

jest.mock('../../utility/logger');
jest.mock('../../services/userService');
jest.mock('../../sockets/chat');
jest.mock('../../repositories/userRepository');

jest.mock('../../config/firebase');
jest.mock('../../services/chatService');

describe('setupSocketEventHandlers', () => {
  beforeEach(() => {
    (mockSocket.on as jest.Mock).mockClear();
    setupSocketEventHandlers(
      mockSocket as Socket<DefaultEventsMap, DefaultEventsMap>
    );
  });

  it('sets up message:sent handler', function () {
    expect(mockSocket.on).toHaveBeenCalledWith(
      'message:sent',
      expect.any(Function)
    );
  });
  it('sets up message:edit handler', function () {
    expect(mockSocket.on).toHaveBeenCalledWith(
      'message:edit',
      expect.any(Function)
    );
  });

  it('sets up message:delete handler', function () {
    expect(mockSocket.on).toHaveBeenCalledWith(
      'message:delete',
      expect.any(Function)
    );
  });

  it('sets up context:opened handler', function () {
    expect(mockSocket.on).toHaveBeenCalledWith(
      'context:opened',
      expect.any(Function)
    );
  });

  it('sets up disconnect handler', function () {
    expect(mockSocket.on).toHaveBeenCalledWith(
      'disconnect',
      expect.any(Function)
    );
  });
});

describe('disconnectedHandler', () => {
  let mockSocket: Socket;
  let removeUserMock: jest.Mock;
  let updateUserMock: jest.Mock;

  beforeEach(() => {
    // Reset the mocks before each test
    mockSocket = {
      id: 'socket-id',
    } as Socket;

    // Mock the method from the Chat instance
    removeUserMock = jest.fn().mockReturnValue('user-id');
    Chat.getInstance = jest.fn().mockReturnValue({
      removeUser: removeUserMock,
    });

    // Mock the updateUserById method
    updateUserMock = updateUserById as jest.Mock;
  });

  it('should log the disconnection and update the user', async () => {
    await disconnectedHandler(mockSocket);

    // Check if the logger was called with the correct message
    expect(logger.info).toHaveBeenCalledWith('User disconnected: socket-id');

    // Check if removeUser was called with the socket.id
    expect(removeUserMock).toHaveBeenCalledWith('socket-id');

    // Check if updateUserById was called with the correct parameters
    expect(updateUserMock).toHaveBeenCalledWith('user-id', {
      activeNow: false,
      lastSeen: expect.any(Date), // Check if a Date is passed
    });
  });

  it('should handle errors gracefully (if any)', async () => {
    // Simulate an error in updateUserById
    updateUserMock.mockRejectedValueOnce(new Error('Something went wrong'));

    await expect(disconnectedHandler(mockSocket)).resolves.not.toThrow();

    // Ensure removeUser is still called even if updateUserById fails
    expect(removeUserMock).toHaveBeenCalledWith('socket-id');
  });
});
