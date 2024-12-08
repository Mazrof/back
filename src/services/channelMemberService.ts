import * as channelMemberRepository from '../repositories/channelMemberRepository';
import * as userRepository from '../repositories/adminRepository';
import { AppError } from '../utility';
import { UpdateChannelMemberData } from '../types';
import { CommunityRole } from '@prisma/client';
import * as channelRepository from '../repositories/channelRepository';


const findChannel = async (channelId: number) => {
  const channel = await channelRepository.findChannelById(channelId);
  if (!channel) {
    throw new AppError('this is no channel with this id', 404);
  }
};

const checkUser = async (userId: number) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError('this is no user with this id', 404);
  }
};

export const checkChannelMemberPermission = async (
  userId: number,
  channelId: number
) => {
  const channelMember = await checkChannelMember(userId, channelId);
  if (channelMember.role !== CommunityRole.admin) {
    throw new AppError('Not Authorized', 403);
  }
};

export const checkChannelMember = async (userId: number, channelId: number) => {
  await findChannel(channelId);
  const channelMember = await channelMemberRepository.findExistingMember(
    userId,
    channelId
  );
  if (!channelMember || !channelMember.active) {
    throw new AppError('the user is not a member of the channel', 404);
  }
  return channelMember;
};

const checkMember = async (userId: number, channelId: number) => {
  await checkUser(userId);
  const existingMember = await channelMemberRepository.findExistingMember(
    userId,
    channelId
  );
  if (existingMember) {
    if (!existingMember.active) {
      return await channelMemberRepository.updateChannelMemberStatus(
        userId,
        channelId,
        true
      );
    }
    throw new AppError('Member already exists in this channel', 400);
  }
  return null;
};

const checkAdmin = async (adminId: number, channelId: number) => {
  if (!adminId) {
    throw new AppError('AdminId is missing', 400);
  }
  const user = await channelMemberRepository.findChannelMember(
    adminId,
    channelId
  );
  if (!user || !user.active || user.role !== CommunityRole.admin) {
    throw new AppError('Not Authorized', 403);
  }
};

export const getChannelMembers = async (channelId: number) => {
  // Check if there is a channel
  await findChannel(channelId);

  return await channelMemberRepository.findChannelMembers(channelId);
};

export const addChannelMember = async (
  userId: number,
  channelId: number,
  role: CommunityRole,
  hasDownloadPermissions: boolean
) => {
  // Check if there is a channel
  await findChannel(channelId);
  // Check if the member already exists in the channel
  const member = await checkMember(userId, channelId);
  if (member) return member;
  // Create a new channel membership for the member
  return await channelMemberRepository.addChannelMember({
    channelId,
    userId,
    role,
    hasDownloadPermissions,
  });
};

export const updateChannelMember = async (
  adminId: number,
  channelId: number,
  userId: number,
  updates: UpdateChannelMemberData
) => {
  // Check if there is a channel
  await findChannel(channelId);
  // Check if the user is an admin in the channel
  await checkAdmin(adminId, channelId);

  const user = await channelMemberRepository.findChannelMember(
    userId,
    channelId
  );

  const existingMember = await channelMemberRepository.findExistingMember(
    userId,
    channelId
  );

  if (!existingMember) {
    throw new AppError('Member not found in this Channel', 404);
  }

  const updatedData: UpdateChannelMemberData = {};
  if (updates.role) {
    updatedData.role =
      updates.role.toLowerCase() === 'admin'
        ? CommunityRole.admin
        : CommunityRole.member;
  }

  if (updates.hasDownloadPermissions) {
    updatedData.hasDownloadPermissions = updates.hasDownloadPermissions;
  }
  if (!updates.role && !updates.hasDownloadPermissions) {
    throw new AppError('Not Data to update', 400);
  }
  return await channelMemberRepository.updateChannelMemberData(
    userId,
    channelId,
    updatedData
  );
};

export const deleteChannelMember = async (
  channelId: number,
  userId: number
) => {
  const existingMember = await channelMemberRepository.findExistingMember(
    userId,
    channelId
  );

  if (!existingMember || !existingMember.active) {
    throw new AppError('Member not found in this channel', 404);
  }
  const channelMember = await channelMemberRepository.updateChannelMemberStatus(
    userId,
    channelId,
    false
  );

  if (existingMember.role === CommunityRole.admin) {
    const adminCount = await channelMemberRepository.getAdminCounts(channelId);
    if (!adminCount) await channelRepository.deleteChannel(channelId);
  }
  return channelMember;
};

export const joinChannelByInvite = async (token: string, userId: number) => {

  const channel: { id: number } | null =
    await channelMemberRepository.findChannelByInvitationLinkHash(
      token
    );

  if (!channel) {
    throw new Error('Invalid or expired invitation link');
  }

  // Check if the member already exists in the group
  const member = await checkMember(userId, channel.id);
  // Create a new group membership for the member
  if (member) return member;
  return await channelMemberRepository.addChannelMember({
    channelId: channel.id,
    userId,
    role: CommunityRole.member,
    hasDownloadPermissions: false,
  });
};
