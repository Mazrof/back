import { requestPasswordReset, resetPassword } from './../services/emailService';
declare module 'express-session' {
  interface SessionData {
    user?: { id: number; userType: string };
  }
}
import { Request, Response } from "express";
import { registerUser, authenticateUser } from "../services/authService";
import { AppError, catchAsync } from "../utility";
import { signupSchema } from "../schemas/authSchema";
import { sendVerificationCode, verifyCode } from "../services/emailService";
import { sendVerificationCodeSMS } from "../services/smsService";
import crypto from "crypto";
import {updateUserById} from "../repositories/userRepository";
export const signup = catchAsync(async (req: Request, res: Response) => {

    const validatedData = signupSchema.parse(req.body); // Zod validation
    const user = await registerUser(validatedData);
    res.status(201).json({ status: "success", data:{user: { id: user.id, username: user.username }} });

});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

    const user = await authenticateUser(email, password);
    if (!user) throw new AppError("Invalid credentials", 401);
    console.log(user)
    if ("bannedUsers" in user) {
      req.session.user = { id: user.id, userType: 'Admin' }; // Store user in session
      res.status(200).json({status: "success", data:{user: { id: user.id, user_type: 'Admin' } }});

    }
    else {
      req.session.user = { id: user.id , userType: 'user'}; // Store user in session
      res.status(200).json({status: "success", data:{user: { id: user.id, user_type: 'user' } }});
    }
    

});

export const whoami = catchAsync(async(req: Request, res: Response) => {
  const user = req.session.user;
  if (!user) throw new AppError("User not logged in", 401);
  res.status(200).json({ status: "success", data: { user } });
});


export const sendVerificationCodeController = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
    }

  // Generate a random 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();


  try {
    await sendVerificationCode(email, code);
    res.status(200).json({status: "success",data: {message: 'Verification code sent'}});
  } catch {
    throw new AppError('Failed to send email', 500);}
});
export const verifyCodeController = catchAsync(async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    throw new AppError('Email and code are required', 400);}

  if (await verifyCode(email, code)) {
    await updateUserById(req.session.user!.id, { IsEmailVerified: true });
    res.status(200).json({status: "success",data: {message: 'Code is valid'}});
  } else {
    throw new AppError('Invalid code', 400);
  }
});

export const sendVerificationCodeSmSController = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    throw new AppError('Phone number is required', 400);
  }

  // Generate a random 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();

  try {
    await sendVerificationCodeSMS(phoneNumber, code);
    res.status(200).json({status: "success",data: {message: 'Verification code sent'}});
  } catch {
    throw new AppError('Failed to send SMS', 500);}
}
);

export const VerifyCodeSMSController = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    throw new AppError('Phone number and code are required', 400);}

  if (await verifyCode(phoneNumber, code)) {
    await updateUserById(req.session.user!.id, { IsPhoneVerified: true });
    res.status(200).json({status: "success",data: {message: 'Code is valid'}});
  } else {
    throw new AppError('Invalid code', 400);}
});


export const logoutController = catchAsync(async(req, res) => {
    req.logout((err) => {
      if (err) throw new AppError("Failed to logout", 500);
      res.clearCookie("connect.sid");
      res.status(200).json({ status: "success", data: { message: "Logged out" } });
    });
  });


  export const requestPasswordResetController = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new AppError('Email is required', 400);
    }
    await requestPasswordReset(email);
    res.status(200).json({
      status: 'success',
      data: { message: 'Reset link sent' },
    });
  });

  export const resetPasswordController = catchAsync(async (req: Request, res: Response) => {
    const { token, newPassword,userId } = req.body;
    if (!userId || !token || !newPassword) {
      throw new AppError('Missing required fields', 400);
    }
    await resetPassword(userId, token, newPassword);
    res.status(200).json({
      status: 'success',
      data: {message:"Password reset successful"},
    });
  });