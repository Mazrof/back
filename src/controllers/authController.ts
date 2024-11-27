import { Request, Response } from 'express';
import { signupUser,loginUser } from '../services/authService';
import crypto from 'crypto';
import { loginSchema, signupSchema } from '../schemas/authSchema'; 
import { catchAsync } from '../utility'; 
import {  SignupControllerResponse } from './controllerTypes/authTypes';
import passport from 'passport';
import logger from '../utility/logger';
import { signToken } from '../utility/jwt';
import { OAuthUser } from '../repositories/repositoriesTypes/authTypes';
import { storeOAuthUser } from '../repositories/userRepository';
import { sendVerificationCode, verifyCode } from '../services/emailService';
import { sendVerificationCodeSMS } from '../services/smsService';

export const signupController = catchAsync(async (req: Request, res: Response) => {
  // Validate the input fields
  const validatedData = signupSchema.parse(req.body); // Zod validation
  await signupUser(validatedData);
  res.status(201).json({ status: 'success'});
});

export const loginController = catchAsync(async (req: Request, res: Response) => {
  // Validate the input fields
  const validatedData = loginSchema.parse(req.body); // Zod validation
  const tokens = await loginUser(validatedData);
  const response : SignupControllerResponse= {access_token: tokens.access_token, refresh_token: tokens.refresh_token, user:tokens.user};
  res.status(201).json({ status: 'success', data: response });
});

export const OAuthController = passport.authenticate("google", { scope: ["profile", "email"] });


export const OAuthCallbackController = [
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    const user = req.user as OAuthUser;
    const saved_user = await storeOAuthUser(user);

    const access_token = signToken(
      {
        id: saved_user?.id,
      },
      '15m' // Expires in 15 minutes
    );
    const refresh_token = signToken(
      {
        id: saved_user?.id,
      },
      '7d' 
    );

    const response = { access_token, refresh_token,user:saved_user };
    res.json({ status: 'success', data: response });
  },
];

export const githubOAuthController = passport.authenticate('github', { scope: ["profile", "email"] });

export const githubOAuthCallbackController = [
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    const user = req.user as OAuthUser;
    const saved_user = await storeOAuthUser(user);

    const access_token = signToken(
      {
        id: saved_user?.id,
      },
      '15m' // Expires in 15 minutes
    );
    const refresh_token = signToken(
      {
        id: saved_user?.id,
      },
      '7d' // Expires in 7 days
    );
    if (!saved_user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    saved_user.password='********';
    saved_user.providerId=null;
    const response = { access_token, refresh_token,user:saved_user };
    res.json({ status: 'success', data: response });
  },
];

 export const sendVerificationCodeController = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Generate a random 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();


  try {
    await sendVerificationCode(email, code);
    res.status(200).json({ message: 'Verification code sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email' });
  }
});
export const verifyCodeController = catchAsync(async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  if (verifyCode(email, code)) {
    res.status(200).json({ message: 'Code is valid' });
  } else {
    res.status(400).json({ message: 'Invalid code' });
  }
});

export const sendVerificationCodeSmSController = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Generate a random 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();

  try {
    await sendVerificationCodeSMS(phoneNumber, code);
    res.status(200).json({ message: 'Verification code sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send SMS' });
  }
}
);

export const VerifyCodeSMSController = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ message: 'Phone number and code are required' });
  }

  if (verifyCode(phoneNumber, code)) {
    res.status(200).json({ message: 'Code is valid' });
  } else {
    res.status(400).json({ message: 'Invalid code' });
  }
});