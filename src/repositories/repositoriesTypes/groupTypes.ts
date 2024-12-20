/**
 * Types for group responses.
 */
export interface GroupResponse {
  id: number;
  groupSize: number;
  adminGroupFilters?: { groupId: number };
  community: {
    name: string;
    privacy: boolean;
    imageURL: string;
  };
}

export interface DetailedGroupResponse extends GroupResponse {
  communityId: number;
  community: {
    name: string;
    privacy: boolean;
    active: boolean;
    imageURL: string;
  };
  hasFilter?: boolean;
}
