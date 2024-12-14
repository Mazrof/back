import express from 'express';
import { addFcmTokenController,sendNotificationController } from '../controllers/notificationsController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const notifactionsRouter = express.Router();

notifactionsRouter.post('/subscripe', isAuthenticated ,addFcmTokenController);

notifactionsRouter.post('/send', isAuthenticated ,sendNotificationController);



export default notifactionsRouter;