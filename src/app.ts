import express, { Request, Response, Application } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import './services/oauth';
import { globalErrorHandler } from './middlewares/error_handlers/error_handler';
import apiRoutes from './routes';
import passport from 'passport';
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import chatRoutes from './routes/chatRoutes';

const redisClient = new Redis();
export default async (app: Application) => {
  const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  });
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  // Serve static files from the 'public' directory
  app.use(express.static(path.join(__dirname, '../public')));

  // Implement CORS
  app.use(
    cors({
      origin: 'http://localhost:3000', // Adjust based on your front-end domain
      credentials: true, // Allow cookies to be sent
    })
  );
  app.use(cookieParser());
  // Session middleware

  app.options('*', cors()); // Preflight for all routes

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
    console.log('hello world');
    res.status(200).json({ msg: 'hello world, MAZROF COMMUNITY' });
  });
  // API routes
  app.use('/api', apiRoutes);

  app.get('/debug/redis', async (req: Request, res: Response) => {
    try {
      //redisClient.flushdb();
      const keys = await redisClient.keys('*');
      const data = await Promise.all(
        keys.map(async (key) => {
          const type = await redisClient.type(key); // Get the key type

          let value;
          if (type === 'hash') {
            value = await redisClient.hgetall(key); // Fetch hash data
          } else if (type === 'string') {
            value = await redisClient.get(key); // Fetch string data
          } else {
            value = `Type ${type} not handled in debug`;
          }

          return { key, type, value };
        })
      );

      res.json({ keys: data });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Error fetching Redis data', details: error });
    }
  });

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
