import RedisStore from 'connect-redis';
import Redis from 'ioredis';
const redisClient = new Redis();

export const sessionConfig = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 2 * 60 * 60, // 1 hour
  },
};
