import bcrypt from 'bcryptjs';
import { createUser } from '../repositories/userRepository';
import { signToken } from '../utility/jwt';
import { AppError } from '../utility';
import { LoginInput, SignupInput } from '../schemas/authSchema';
import * as userRepo from '../repositories/userRepository';
import { HTTPERROR } from '../constants/HTTPERROR';
import { LoginServiceResponse, SignupServiceResponse } from './servicesTypes/authServiceTypes';


export const signupUser = async (data: SignupInput):Promise<SignupServiceResponse> => {
    const { email } = data;
  
    // Check for duplicate email
    const existingUser = await userRepo.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', HTTPERROR.CONFLICT); 
    }
    const existingUsername = await userRepo.findUserByUsername(data.username);
    if (existingUsername) {
      throw new AppError('Username already in use', HTTPERROR.CONFLICT); 
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userData = {
        email,
        username: data.username,
        password: hashedPassword,
        phone: data.phone,
      };
      
      const user = await createUser(userData);
  
      const access_token = signToken({ id: user.id }, '15m'); // Expires in 15 minutes
      const refresh_token = signToken({ id: user.id }, '7d'); // Expires in 7 days
    
      return { access_token, refresh_token };
  };

  export const loginUser = async (data: LoginInput):Promise<LoginServiceResponse> => {
    let user = await userRepo.findUserByEmail(data.email);
  
    if (!user) {
      throw new AppError('User not found', HTTPERROR.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', HTTPERROR.UNAUTHORIZED);
    }
    user.password='********';
    user.providerId=null;
    const access_token = signToken({ id: user.id }, '15m'); // Expires in 15 minutes
    const refresh_token = signToken({ id: user.id }, '7d'); // Expires in 7 days
    
      return { access_token, refresh_token,user};
  };