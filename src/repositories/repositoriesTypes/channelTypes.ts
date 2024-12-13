export type commonChannelResponse = {
  id: number;
  canAddComments: boolean;
  communityId: number;
  community: {
    name: string;
    privacy: boolean;
    imageURL: string;
  };
};

export type ChannelResponse = {
  id: number;
  canAddComments: boolean;
  communityId: number;
  community: {
    name: string;
    privacy: boolean;
    imageURL: string;
    active: boolean;
  };
};

export type selectType = {
  id: boolean;
  communityId: boolean;
  canAddComments: boolean;
  invitationLink: boolean;
  community: {
    select: {
      name: boolean;
      privacy: boolean;
      imageURL: boolean;
      active: boolean;
    };
  };
};
