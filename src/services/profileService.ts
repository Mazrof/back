// src/service/profileService.ts
import { AppError } from '../utility';
import * as profileRepository from '../repositories/profileRepository';
import { Users } from '@prisma/client';
import {
  getFileFromFirebase,
  uploadFileToFirebase,
} from '../third_party_services';

const isValidPhoneNumber = (phoneNumber: string) => {
  const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(phoneNumber);
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getAllProfiles = async (): Promise<Users[]> => {
  const users: Users[] = await profileRepository.findAllProfiles();
  return await Promise.all(
    users.map(async (user) => {
      // user.photo = await getFileFromFirebase(user.photo);
      return user;
    })
  );
};

export const getProfileById = async (id: number): Promise<Users | null> => {
  const user: any = await profileRepository.findProfileById(id);
  //user.photo = await getFileFromFirebase(user.photo);
  return user;
};
export const createProfile = async (data: any) => {
  if (data.phone && !isValidPhoneNumber(data.phone)) {
    throw new AppError('Invalid phone number', 400);
  }
  if (data.email && !isValidEmail(data.email)) {
    throw new AppError('Invalid email format', 400);
  }
  if (data.photo) {
    //  data.photo = await uploadFileToFirebase(data.photo);
  }
  return await profileRepository.createProfile(data);
};

export const updateProfile = async (id: number, data: any) => {
  if (data.phone && !isValidPhoneNumber(data.phone)) {
    throw new AppError('Invalid phone number', 400);
  }
  if (data.email && !isValidEmail(data.email)) {
    throw new AppError('Invalid email format', 400);
  }
  if (data.photo) {
    //   data.photo = await uploadFileToFirebase(data.photo);
  }
  const updatedUser = await profileRepository.updateProfileById(id, data);
  if (!updatedUser) throw new AppError('No profile found with that ID', 404);
  return updatedUser;
};
