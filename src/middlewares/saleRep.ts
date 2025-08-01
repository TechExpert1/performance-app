import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./user";

export const salesRepAuth = (
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as AuthenticatedRequest["user"];
    if (
      !req.user ||
      (req.user.role !== "superAdmin" && req.user.role !== "salesRep")
    ) {
      res.status(403).json({
        message: `Forbidden: Gym Owner or Admin access or salesRep required, cant access with ${req?.user?.role} account`,
      });
      return;
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
