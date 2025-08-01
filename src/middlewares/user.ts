import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

export const userAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.token as string;
    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const user = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = user as AuthenticatedRequest["user"];
    if (
      !req.user ||
      (req.user.role !== "gymOwner" &&
        req.user.role !== "superAdmin" &&
        req.user.role !== "salesRep" &&
        req.user.role !== "athlete")
    ) {
      res.status(403).json({
        message: `Forbidden: Need an valid token for accessing resource`,
      });
      return;
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
