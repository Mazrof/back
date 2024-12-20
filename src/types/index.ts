import { CommunityRole } from '@prisma/client';
// this folder is for TypeScript types and interfaces, which can be shared across files for better type checking.
export interface UpdateGroupMemberData {
  role?: CommunityRole;
  hasMessagePermissions?: boolean;
  hasDownloadPermissions?: boolean;
}
