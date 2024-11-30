export const corsConfig = {
    origin: `${process.env.FRONTEND_URL}`, // Adjust based on your front-end domain
    credentials: true, // Allow cookies to be sent
    exposedHeaders: ['set-cookie'], // Allow the front-end to read the cookie
    
  }