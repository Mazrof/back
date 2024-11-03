import { Request, Response } from 'express';
import { signupUser,loginUser } from '../services/authService'; 
import { loginSchema, signupSchema } from '../schemas/authSchema'; 
import { catchAsync } from '../utility'; 
import { SignupControllerResponse } from './controllerTypes/authTypes';


export const signupController = catchAsync(async (req: Request, res: Response) => {
  // Validate the input fields
  const validatedData = signupSchema.parse(req.body); // Zod validation
  const tokens = await signupUser(validatedData);
  const response : SignupControllerResponse= {access_token: tokens.access_token, refresh_token: tokens.refresh_token};
  res.status(201).json({ status: 'success', data: response });
});

export const loginController = catchAsync(async (req: Request, res: Response) => {
  // Validate the input fields
  const validatedData = loginSchema.parse(req.body); // Zod validation
  const tokens = await loginUser(validatedData);
  const response : SignupControllerResponse= {access_token: tokens.access_token, refresh_token: tokens.refresh_token};
  res.status(201).json({ status: 'success', data: response });
});