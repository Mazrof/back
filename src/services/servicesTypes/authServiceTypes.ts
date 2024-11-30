export type SignupServiceResponse = {
  access_token: string;
  refresh_token: string;
};

export type LoginServiceResponse = {
  access_token: string;
  refresh_token: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
};
