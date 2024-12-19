import {
  requestPasswordReset,
  resetPassword,
} from './../services/emailService';
import { redisClient } from '../config/sessionConfig';
declare module 'express-session' {
  interface SessionData {
    user?: { id: number; userType: string; user: unknown, systemInfo?: unknown };
  }
}
interface CustomRequest extends Request {
  useragent: {
    platform: string;
    browser: string;
    isMobile: boolean;
    isDesktop: boolean;
    os: string;
  };
}
import { Request, Response } from 'express';
import { registerUser, authenticateUser } from '../services/authService';
import { AppError, catchAsync } from '../utility';
import { signupSchema } from '../schemas/authSchema';
import { sendVerificationCode, verifyCode } from '../services/emailService';
import { sendVerificationCodeSMS } from '../services/smsService';
import crypto from 'crypto';

export const signup = catchAsync(async (req: Request, res: Response) => {
  const validatedData = signupSchema.parse(req.body); // Zod validation
  const user = await registerUser(validatedData);
  res.status(201).json({
    status: 'success',
    data: { user: { id: user.id, username: user.username } },
  });
});

export const login = catchAsync(async (req: CustomRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await authenticateUser(email, password);
  user.password = undefined;
  if (!user) throw new AppError('Invalid credentials', 401);
  if ('bannedUsers' in user) {
    req.session.user = { id: user.id, userType: 'Admin',user }; // Store user in session
    res.status(200).json({
      status: 'success',
      data: { user: { id: user.id, user_type: 'Admin',user } },
    });
  } else {
    const systemInfo = {
      platform: req.useragent.platform, // e.g., Windows, Mac, Linux
      browser: req.useragent.browser,   // e.g., Chrome, Safari
      isMobile: req.useragent.isMobile, // true if the device is mobile
      isDesktop: req.useragent.isDesktop, // true if the device is desktop
      os: req.useragent.os,             // e.g., Windows 10, macOS
    };

    req.session.user = {
      id: user.id,
      userType: 'user',
      user,
      systemInfo,
    };
    res.status(200).json({
      status: 'success',
      data: { user: { id: user.id, user_type: 'user',user } },
    });
  }
});

export const whoami = catchAsync(async (req: Request, res: Response) => {
  const user = req.session.user;
  if (!user) throw new AppError('User not logged in', 401);
  res.status(200).json({ status: 'success', data: { user } });
});

export const sendVerificationCodeController = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Generate a random 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    try {
      await sendVerificationCode(email, code);
      res.status(200).json({
        status: 'success',
        data: { message: 'Verification code sent' },
      });
    } catch {
      throw new AppError('Failed to send email', 500);
    }
  }
);
export const verifyCodeController = catchAsync(
  async (req: Request, res: Response) => {
    const { email, code } = req.body;

    if (!email || !code) {
      throw new AppError('Email and code are required', 400);
    }

    if (await verifyCode(email, code)) {
      res
        .status(200)
        .json({ status: 'success', data: { message: 'Code is valid' } });
    } else {
      throw new AppError('Invalid code', 400);
    }
  }
);

export const sendVerificationCodeSmSController = catchAsync(
  async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      throw new AppError('Phone number is required', 400);
    }

    // Generate a random 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    try {
      await sendVerificationCodeSMS(phoneNumber, code);
      res.status(200).json({
        status: 'success',
        data: { message: 'Verification code sent' },
      });
    } catch {
      throw new AppError('Failed to send SMS', 500);
    }
  }
);

export const VerifyCodeSMSController = catchAsync(
  async (req: Request, res: Response) => {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      throw new AppError('Phone number and code are required', 400);
    }

    if (await verifyCode(phoneNumber, code)) {
      res
        .status(200)
        .json({ status: 'success', data: { message: 'Code is valid' } });
    } else {
      throw new AppError('Invalid code', 400);
    }
  }
);

export const logoutController = catchAsync(async (req, res) => {
  req.logout((err) => {
    if (err) throw new AppError('Failed to logout', 500);
    res.clearCookie('connect.sid');
    res
      .status(200)
      .json({ status: 'success', data: { message: 'Logged out' } });
  });
});

export const requestPasswordResetController = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new AppError('Email is required', 400);
    }
    await requestPasswordReset(email);
    res.status(200).json({
      status: 'success',
      data: { message: 'Reset link sent' },
    });
  }
);

export const resetPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const { token, newPassword, userId } = req.body;
    if (!userId || !token || !newPassword) {
      throw new AppError('Missing required fields', 400);
    }
    await resetPassword(userId, token, newPassword);
    res.status(200).json({
      status: 'success',
      data: { message: 'Password reset successful' },
    });
  }
);


// eslint-disable-next-line consistent-return
export const getUserSessions = catchAsync(async (req: Request, res: Response) => {
  const userId=req.session.user.id;
  try {
    const keys = await redisClient.keys('sess:*');
    const userSessions = await Promise.all(
      keys.map(async (key) => {
        const sessionData = await redisClient.get(key);
        const session = JSON.parse(sessionData);

        if (session?.user?.id === userId) {
          return { key, data: session };
        }
        return null;
      })
    );

    // Filter out null values (non-matching sessions)
    const filteredSessions = userSessions.filter((session) => session !== null);

    if (filteredSessions.length === 0) {
      return res.status(404).json({ error: `No sessions found for user ID ${userId}` });
    }

    res.json({ status: 'success', data: filteredSessions });
  } catch (error) {
    throw new AppError('Failed to retrieve sessions', 500);
  }
});

export const endUserSession = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.body;
  if (!key) {
    throw new AppError('Session key is required', 400);
  }

  await redisClient.del(key);
  res.json({ status: 'success', data: { message: 'Session ended' } });
});



