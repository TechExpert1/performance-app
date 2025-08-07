import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./user";
import { StatusCodes } from "http-status-codes";
export const salesRepAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token = req.headers?.authorization;

    const isInvalid = !token && !token?.startsWith("Bearer ");

    if (isInvalid) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Access Denied: No Bearer token provided",
      });
      return;
    }

    token = token!.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as AuthenticatedRequest["user"];
    if (
      !req.user ||
      (req.user.role !== "superAdmin" && req.user.role !== "salesRep")
    ) {
      res.status(403).json({
        message: `Forbidden: Admin access or salesRep required, cant access with ${req?.user?.role} account`,
      });
      return;
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
