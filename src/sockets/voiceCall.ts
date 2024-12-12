// import { Server, Socket } from 'socket.io';
//
// class VoiceCall {
//   private callManager: CallManager;
//   private callLogger: CallLogger;
//   constructor(private io: Server) {
//     this.callManager = new CallManager(this.io);
//     this.callLogger = new CallLogger();
//   }
//
//   init(socket: Socket) {
//     // Call-related events
//     socket.on('create-call', this.handleCreateCall.bind(this));
//     socket.on('join-call', this.handleJoinCall.bind(this));
//     socket.on('leave-call', this.handleLeaveCall.bind(this));
//     socket.on('offer', this.handleOffer.bind(this));
//     socket.on('answer', this.handleAnswer.bind(this));
//     socket.on('ice-candidate', this.handleIceCandidate.bind(this));
//     //todo:update this
//     socket.on('disconnect', () => {
//       this.handleDisconnect(socket);
//     });
//   }
//
//   handleCreateCall(callDetails) {
//     // Create a new call room
//     const callId = this.callManager.createCall(callDetails);
//     this.callLogger.startCall(callId, callDetails);
//   }
//
//   handleJoinCall(joinDetails) {
//     // Join an existing call room
//     const joined = this.callManager.joinCall(joinDetails);
//     if (joined) {
//       this.callLogger.userJoined(joinDetails.callId, joinDetails.userId);
//     }
//   }
//
//   handleLeaveCall(leaveDetails) {
//     // Handle user leaving a call
//     this.callManager.leaveCall(leaveDetails);
//     this.callLogger.endUserCall(leaveDetails.callId, leaveDetails.userId);
//   }
//
//   handleOffer(offerDetails) {
//     // Relay WebRTC offer to another participant
//     this.callManager.relayOffer(offerDetails);
//   }
//
//   handleAnswer(answerDetails) {
//     // Relay WebRTC answer to another participant
//     this.callManager.relayAnswer(answerDetails);
//   }
//
//   handleIceCandidate(candidateDetails) {
//     // Relay ICE candidates for WebRTC connection
//     this.callManager.relayIceCandidate(candidateDetails);
//   }
//
//   handleDisconnect(socket) {
//     // Clean up user's active calls
//     this.callManager.cleanupUserCalls(socket.id);
//     this.callLogger.disconnectUser(socket.id);
//   }
// }
//
// class CallManager {
//   private io: any;
//   private calls: Map<any, any>;
//   private userCalls: Map<any, any>;
//   constructor(io) {
//     this.io = io;
//     this.calls = new Map(); // Store active calls
//     this.userCalls = new Map(); // Track calls per user
//   }
//
//   createCall(callDetails) {
//     // Generate unique call ID
//     const callId = this.generateCallId();
//
//     // Create call room
//     this.calls.set(callId, {
//       id: callId,
//       creator: callDetails.userId,
//       participants: new Set([callDetails.userId]),
//       maxParticipants: callDetails.maxParticipants || 10,
//       type: callDetails.type || 'one-on-one',
//     });
//
//     // Track user's active calls
//     this.trackUserCall(callDetails.userId, callId);
//
//     return callId;
//   }
//
//   joinCall(joinDetails) {
//     const call = this.calls.get(joinDetails.callId);
//
//     if (!call) return false;
//
//     // Check participant limit
//     if (call.participants.size >= call.maxParticipants) {
//       return false;
//     }
//
//     call.participants.add(joinDetails.userId);
//     this.trackUserCall(joinDetails.userId, joinDetails.callId);
//
//     // Notify other participants of new user
//     this.notifyNewParticipant(joinDetails.callId, joinDetails.userId);
//
//     return true;
//   }
//
//   leaveCall(leaveDetails) {
//     const call = this.calls.get(leaveDetails.callId);
//
//     if (!call) return;
//
//     call.participants.delete(leaveDetails.userId);
//     this.removeUserCall(leaveDetails.userId, leaveDetails.callId);
//
//     // Remove call if no participants
//     if (call.participants.size === 0) {
//       this.calls.delete(leaveDetails.callId);
//     }
//   }
//
//   relayOffer(offerDetails) {
//     // Relay WebRTC offer to target participant
//     this.io.to(offerDetails.targetId).emit('offer', offerDetails);
//   }
//
//   relayAnswer(answerDetails) {
//     // Relay WebRTC answer to original caller
//     this.io.to(answerDetails.targetId).emit('answer', answerDetails);
//   }
//
//   relayIceCandidate(candidateDetails) {
//     // Relay ICE candidates for WebRTC connection
//     this.io
//       .to(candidateDetails.targetId)
//       .emit('ice-candidate', candidateDetails);
//   }
//
//   cleanupUserCalls(userId) {
//     const userActiveCalls = this.userCalls.get(userId) || [];
//
//     userActiveCalls.forEach((callId) => {
//       const call = this.calls.get(callId);
//       if (call) {
//         call.participants.delete(userId);
//
//         // Remove call if no participants
//         if (call.participants.size === 0) {
//           this.calls.delete(callId);
//         }
//       }
//     });
//
//     this.userCalls.delete(userId);
//   }
//
//   trackUserCall(userId, callId) {
//     if (!this.userCalls.has(userId)) {
//       this.userCalls.set(userId, new Set());
//     }
//     this.userCalls.get(userId).add(callId);
//   }
//
//   removeUserCall(userId, callId) {
//     const userCalls = this.userCalls.get(userId);
//     if (userCalls) {
//       userCalls.delete(callId);
//       if (userCalls.size === 0) {
//         this.userCalls.delete(userId);
//       }
//     }
//   }
//
//   generateCallId() {
//     return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }
//
//   notifyNewParticipant(callId, newUserId) {
//     const call = this.calls.get(callId);
//     if (call) {
//       call.participants.forEach((participantId) => {
//         if (participantId !== newUserId) {
//           this.io.to(participantId).emit('new-participant', {
//             callId,
//             userId: newUserId,
//           });
//         }
//       });
//     }
//   }
// }
//
// class CallLogger {
//   private callLogs: Map<any, any>;
//   constructor() {
//     this.callLogs = new Map();
//   }
//
//   startCall(callId, callDetails) {
//     this.callLogs.set(callId, {
//       id: callId,
//       creator: callDetails.userId,
//       startTime: Date.now(),
//       endTime: null,
//       participants: new Set([callDetails.userId]),
//       duration: 0,
//     });
//   }
//
//   userJoined(callId, userId) {
//     const callLog = this.callLogs.get(callId);
//     if (callLog) {
//       callLog.participants.add(userId);
//     }
//   }
//
//   endUserCall(callId, userId) {
//     const callLog = this.callLogs.get(callId);
//     if (callLog) {
//       callLog.participants.delete(userId);
//
//       // End call if no participants
//       if (callLog.participants.size === 0) {
//         this.endCall(callId);
//       }
//     }
//   }
//
//   endCall(callId) {
//     const callLog = this.callLogs.get(callId);
//     if (callLog && !callLog.endTime) {
//       callLog.endTime = Date.now();
//       callLog.duration = callLog.endTime - callLog.startTime;
//
//       // Optionally save to database or send to analytics
//       this.saveCallLog(callLog);
//     }
//   }
//
//   disconnectUser(userId) {
//     // Find and end calls for disconnected user
//     this.callLogs.forEach((callLog, callId) => {
//       if (callLog.participants.has(userId)) {
//         this.endUserCall(callId, userId);
//       }
//     });
//   }
//
//   saveCallLog(callLog) {
//     // Implement persistence logic (e.g., save to database)
//     console.log('Call Log:', callLog);
//   }
// }
// export { VoiceCall };
