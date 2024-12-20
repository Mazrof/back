import express, { Request, Response, Application } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import './services/oauth';
import useragent from 'express-useragent';
import { globalErrorHandler } from './middlewares/error_handlers/error_handler';
import apiRoutes from './routes';
import passport from 'passport';
import session from 'express-session';
import { sessionConfig } from './config/sessionConfig';
import { corsConfig } from './config/corsConfig';
import { serveStaticFiles } from './middlewares/imageHandlers';

export const sessionMiddleware = session(sessionConfig);

export default async (app: Application) => {
  // Serve static files from the 'public' directory
  app.use(express.static(path.join(__dirname, '../../public')));

  // Serve static assets
  serveStaticFiles(app);

  // Implement CORS
  app.use(cors(corsConfig));
  app.use(cookieParser());
  // Session middleware

  app.options(process.env.FRONTEND_URL, cors()); // Preflight for all routes

  app.use(useragent.express());
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // Rate limiting middleware
  const limiter = rateLimit({
    max: 100, // limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api', limiter); // Apply rate limiting to API routes

  // Compression middleware for response bodies
  app.use(compression());

  // Cookie parsing middleware
  app.use(cookieParser());

  // Body parsing middleware
  app.use(express.json({ limit: '100mb' })); // Limit JSON body size
  app.use(express.urlencoded({ extended: true, limit: '100mb' })); // For form data

  // Logging middleware for development
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Base route
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ msg: 'hello world, MAZROF COMMUNITY' });
  });

  // API routes
  app.use('/api', apiRoutes);

  // Handle all undefined routes
  app.all('*', (req: Request, res: Response) => {
    res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server!`,
    });
  });
  // Global error handler
  app.use(globalErrorHandler);

  return app;
};
