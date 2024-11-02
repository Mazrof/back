// this folder is for TypeScript types and interfaces, which can be shared across files for better type checking.
export interface UpdateGroupMemberData {
  role?: string;
  hasMessagePermissions?: boolean;
  hasDownloadPermissions?: boolean;
}
