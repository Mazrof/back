import express from 'express';
import { addFcmTokenController,sendNotificationController,sendNotificationsController,
    addMutedParticipantController,removeMutedParticipantController,updateMutedParticipantController
 } from '../controllers/notificationsController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const notifactionsRouter = express.Router();

notifactionsRouter.post('/subscripe', isAuthenticated ,addFcmTokenController);

notifactionsRouter.post('/send', isAuthenticated ,sendNotificationController);

notifactionsRouter.post('/sendall',sendNotificationsController);

notifactionsRouter.post('/mute', isAuthenticated ,addMutedParticipantController);
notifactionsRouter.post('/unmute', isAuthenticated ,removeMutedParticipantController);
notifactionsRouter.post('/update', isAuthenticated ,updateMutedParticipantController);

export default notifactionsRouter;