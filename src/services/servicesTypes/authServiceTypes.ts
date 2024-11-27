export type SignupServiceResponse = {
    access_token: string;
    refresh_token: string;
};

export type LoginServiceResponse = {
    access_token: string;
    refresh_token: string;
    user: any;
};
