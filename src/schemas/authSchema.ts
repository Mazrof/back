import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format').min(1),
  username: z.string().min(1),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginInput = z.infer<typeof loginSchema>;
