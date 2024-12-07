import Redis from 'ioredis';
import nodemailer from 'nodemailer';
import { AppError } from '../utility';
import crypto from 'crypto';
import { findUserByEmail, updateUserById } from '../repositories/userRepository';

// Connect to Redis with host, port, and password from environment variables
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1', // Default to localhost
  port: parseInt(process.env.REDIS_PORT, 10) || 6379, // Default to port 6379
  password: process.env.REDIS_PASSWORD || '', // Default to no password
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Send verification code
export const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: '"Mazroof" <no-reply@Mazroof.com>',
    to: email,
    subject: 'Email Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    // Store the code in Redis with a 10-minute expiration
    await redis.set(`verification:${email}`, code, 'EX', 600);

    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError('Failed to send email', 500);
  }
};

// Verify the code
export const verifyCode = async (email, code) => {
  const storedCode = await redis.get(`verification:${email}`);
  if (!storedCode) {
    throw new AppError('Code expired', 400);
  }

  const isValid = storedCode === code;
  if (isValid) {
    await redis.del(`verification:${email}`);
  }

  return isValid;
};

// Request password reset
export const requestPasswordReset = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  await redis.set(`passwordReset:${user.id}`, tokenHash, 'EX', 900);

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user.id}`;

  const mailOptions = {
    from: '"Mazroof" <no-reply@yourapp.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetUrl}">${resetUrl}</a>
           <p>If you did not request this, please ignore this email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

export const resetPassword = async (
  id: number,
  token: string,
  newPassword: string
) => {
  // Retrieve the stored hash
  const storedTokenHash = await redis.get(`passwordReset:${id}`);
  if (!storedTokenHash) {
    throw new AppError('Token is invalid or expired', 400);
  }

  const incomingTokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  if (storedTokenHash !== incomingTokenHash) {
    throw new AppError('Token is invalid', 400);
  }

  const hashedPassword = crypto
    .createHash('sha256')
    .update(newPassword)
    .digest('hex');
  await updateUserById(id, { password: hashedPassword });
  await redis.del(`passwordReset:${id}`);
};
