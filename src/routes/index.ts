import express from 'express';
import groupRoutes from './groupRoutes';
import adminRoutes from './adminRoutes';
import authRouter from './authRoutes';
import channelRoutes from './channelRoutes';
import profileRouter from './profileRoutes';
import storiesRouter from './storiesRoutes';
import searchRouter from './searchRoutes';
import userRouter from './userRoutes';
import chatRoutes from './chatRoutes';
import { isAuthenticated } from '../middlewares/authMiddleware';
// import filterContent from '../middlewares/contentFilterMiddleware';

const router = express.Router();

// router.post(
//   '/v1',
//   async (req, res) => {
//     try {
//       // Ensure req.body contains type and content
//       if (!req.body.type || !req.body.content) {
//          res.status(400).json({
//           message: 'Type and content are required.',
//         });
//       }
//
//       // Call filterContent with await to handle the asynchronous nature of the function
//       const ans = await filterContent(req.body.type, req.body.content);
//
//       // Send the response
//       res.status(200).json({
//         ans,
//       });
//     } catch (error) {
//       console.error('Error filtering content:', error);
//       res.status(500).json({
//         message: 'An error occurred while processing the content.',
//       });
//     }
//   }
// );
router.use('/v1/auth', authRouter);
router.use(isAuthenticated);
router.use('/v1/admins', adminRoutes);
router.use('/v1/groups', groupRoutes);
router.use('/v1/channels', channelRoutes);
router.use('/v1/profile', profileRouter);
router.use('/v1/stories', storiesRouter);
router.use('/v1/search', searchRouter);
router.use('/v1/user', userRouter);
router.use('/v1/chats', chatRoutes);

export default router;
