import { Request, Response } from 'express';

export const OAuthSessionHandler = (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req.session.user = { id: (req.user as any).id, userType: 'user' }; // Store user in session
  res.redirect(`${process.env.FRONTEND_URL}`);
};
