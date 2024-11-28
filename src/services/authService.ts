import {createUser,findUserByEmail} from '../repositories/userRepository';
import bcrypt from "bcryptjs";
import { AppError } from '../utility';
import { SignupInput } from '../schemas/authSchema';
import * as userRepo from '../repositories/userRepository';
import { HTTPERROR } from '../constants/HTTPERROR';

export const registerUser = async (data:SignupInput) => {
  const { email } = data;
    // Check for duplicate email
    const existingUser = await userRepo.findUserByEmail(email);
    console.log(existingUser)
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
        public_key: "",
      };
      console.log(userData);
      const user = await createUser(userData)
      return user;
};

export const authenticateUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (user && (await bcrypt.compare(password, user.password))) {
    return user;
  }
  throw new AppError('Invalid credentials', HTTPERROR.UNAUTHORIZED);
};

