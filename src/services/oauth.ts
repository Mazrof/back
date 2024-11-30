import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'; // or passport-google-oauth2 for older version
import { Strategy as GitHubStrategy } from 'passport-github2';
import * as userRepo from '../repositories/userRepository';
import { OAuthUser } from '../repositories/repositoriesTypes/authTypes';
import { Social } from '@prisma/client';
// Your Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userRepo.findUserByProvider(profile.id, Social.google);
        if (user) {
          return done(null, user);
        }
        const userToInsert: OAuthUser = {
          providerId: profile.id,
          email: profile._json.email as string,
          provider: 'google',
          userName: profile.displayName,
          email_verified: profile._json.email_verified as boolean,
          picture: profile._json.picture as string,
        };
        const saved_user = await userRepo.storeOAuthUser(userToInsert);
        return done(null, saved_user);
      } catch (err) {
        console.log('Error on google OAUTH', err);
        return done(err, false);
      }
    }
  )
);

// Serialize user into the session
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await userRepo.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      console.log(profile);
      try {
        let user = await userRepo.findUserByProvider(profile.id, Social.github);
        if (user) {
          return done(null, user);
        }
        const userToInsert: OAuthUser = {
          providerId: profile.id,
          email: profile._json.email as string,
          provider: 'github',
          userName: profile.username,
          email_verified: profile._json.email_verified as boolean,
          picture: profile._json.avatar_url as string,
        };
        const saved_user = await userRepo.storeOAuthUser(userToInsert);
        return done(null, saved_user);
      } catch (err) {
        console.log('Error on github OAUTH', err);
        return done(err, false);
      }
    }
  )
);

export default passport;
