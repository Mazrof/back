declare module 'express-session' {
  interface SessionData {
    user?: { id: number; username: string };
  }
}

import { Request, Response } from "express";
import { registerUser, authenticateUser } from "../services/authService";
import { catchAsync } from "../utility";
import { signupSchema } from "../schemas/authSchema";
import { sendVerificationCode, verifyCode } from "../services/emailService";
import { sendVerificationCodeSMS } from "../services/smsService";
import crypto from "crypto";
export const signup = catchAsync(async (req: Request, res: Response) => {

    const validatedData = signupSchema.parse(req.body); // Zod validation
    const user = await registerUser(validatedData);
    res.status(201).json({ message: "User registered", user: { id: user.id, username: user.username } });

});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

    const user = await authenticateUser(email, password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    req.session.user = { id: user.id, username: user.username }; // Store user in session
    res.json({ message: "Login successful", user: { id: user.id, username: user.username } });

});

export const whoami = catchAsync(async(req: Request, res: Response) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  res.json({ user });
});


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

