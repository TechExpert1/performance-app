import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./user";
export const gymOwnerAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized: No user found in request" });
    return;
  }

  if (req.user.role !== "gymOwner") {
    res
      .status(403)
      .json({ message: "Forbidden: Access allowed only for gym owners" });
    return;
  }

  next();
};
