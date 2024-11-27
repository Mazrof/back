// import { DefaultEventsMap } from 'socket.io';
// import { Socket } from 'socket.io';
// import { setupSocketEventHandlers } from '../sockets/listeners/chatListeners';
//
// const mockSocket: Partial<
//   Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
// > = {
//   on: jest.fn(),
//   emit: jest.fn(),
//   // Add any other methods you need to have mocked
// };
//
// describe('setupSocketEventHandlers', () => {
//   beforeEach(() => {
//     (mockSocket.on as jest.Mock).mockClear();
//     (mockSocket.emit as jest.Mock).mockClear();
//
//     setupSocketEventHandlers(
//       mockSocket as Socket<
//         DefaultEventsMap,
//         DefaultEventsMap,
//         DefaultEventsMap,
//         any
//       >
//     );
//   });
//
//   it('sets up message:sent handler', function () {
//     expect(mockSocket.on).toHaveBeenCalledWith(
//       'message:sent',
//       expect.any(Function)
//     );
//   });
//   it('sets up message:edit handler', function () {
//     expect(mockSocket.on).toHaveBeenCalledWith(
//       'message:edit',
//       expect.any(Function)
//     );
//   });
//
//   it('sets up message:delete handler', function () {
//     expect(mockSocket.on).toHaveBeenCalledWith(
//       'message:delete',
//       expect.any(Function)
//     );
//   });
//
//   it('sets up context:opened handler', function () {
//     expect(mockSocket.on).toHaveBeenCalledWith(
//       'context:opened',
//       expect.any(Function)
//     );
//   });
//
//   it('sets up disconnect handler', function () {
//     expect(mockSocket.on).toHaveBeenCalledWith(
//       'disconnect',
//       expect.any(Function)
//     );
//   });
// });
