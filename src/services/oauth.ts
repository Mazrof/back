import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'; // or passport-google-oauth2 for older version
import { Strategy as GitHubStrategy } from 'passport-github2';
import * as userRepo from '../repositories/userRepository';
import { OAuthUser } from '../repositories/repositoriesTypes/authTypes';
// Your Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

passport.use(new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/v1/auth/google/callback",
  },
  (accessToken, refreshToken, profile, done) => {
    const user:OAuthUser={
      providerId: profile.id,
      email: profile._json.email as string,
      provider: 'google',
      userName: profile.displayName,
      email_verified: profile._json.email_verified as boolean,
      picture: profile._json.picture as string,
    }
    return done(null, user);
  }
));

// Serialize and deserialize user info (optional for session management)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  return done(null, user);
});




const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/v1/auth/github/callback',
    },
    (accessToken: any, refreshToken: any, profile: any, done: (arg0: null, arg1: any) => any) => {
      const user: OAuthUser = {
        providerId: profile.id,
        email: profile._json.email as string,
        provider: 'github',
        userName: profile.username,
        email_verified: false,
        picture: profile._json.avatar_url as string,
      };
      //userRepo.storeOAuthUser(user);
      return done(null, user);
    }
  )
);