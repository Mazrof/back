import e from 'express';
import nodemailer from 'nodemailer';
import { AppError } from '../utility';

const verificationCodes: { [email: string]: string } = {};
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationCode = async (email: string, code: string) => {
  const mailOptions = {
    from: '"Mazroof" <no-reply@Mazroof.com>',
    to: email,
    subject: 'Email Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    verificationCodes[email] = code
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError('Failed to send email', 500);
  }
};

export const verifyCode = (email: string, code: string) => {
    if (!verificationCodes[email]) {
      return false;
    }
    return verificationCodes[email] === code;
    }
