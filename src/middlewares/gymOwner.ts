import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./user";

export const gymOwnerAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token = req.headers.token as string;

    // If token not found in req.headers.token, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      console.warn("gymOwnerAuth: No token provided in headers");
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as AuthenticatedRequest["user"];
    if (
      !req.user ||
      (req.user.role !== "gymOwner" &&
        req.user.role !== "coach" &&
        req.user.role !== "superAdmin" &&
        req.user.role !== "salesRep")
    ) {
      console.warn(`gymOwnerAuth: Invalid role - ${req.user?.role}`);
      res.status(403).json({
        message: `Forbidden: Gym Owner or Admin access or salesRep required, cant access with ${req?.user?.role} account`,
      });
      return;
    }
    next();
  } catch (err) {
    console.error("gymOwnerAuth: JWT verification failed", {
      error: err instanceof Error ? err.message : "Unknown error",
      headers: req.headers,
    });
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
