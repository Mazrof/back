// this folder is for TypeScript types and interfaces, which can be shared across files for better type checking.
export interface UpdateCommunityMemberData {
  role?: string;
  cRole?: ChannelRole;
  hasMessagePermissions?: boolean;
  hasDownloadPermissions?: boolean;
}

// Define the enum and map it to the database field
export enum ChannelRole {
  admin = 'admin',
  member = 'member',
}

// Interface for updating community member data
export interface UpdateChannelMemberData {
  role?: ChannelRole; // Using ChannelRole instead of string for type safety
  hasMessagePermissions?: boolean;
  hasDownloadPermissions?: boolean;
}
