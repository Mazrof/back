import { Request, Response, NextFunction } from "express";
import { AppError } from "../utility";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user) {
    return next();
  }
  throw new AppError("Unauthorized", 401);
};
