import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

interface AdminPayload {
  id: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AdminPayload;
    }
  }
}

export const verifyAdminToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers?.authorization;

    const isInvalid = !authHeader && !authHeader?.startsWith("Bearer ");

    if (isInvalid) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Access Denied: No Bearer token provided",
      });
      return;
    }

    const token = authHeader!.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AdminPayload;

    if (!decoded || decoded.role !== "superAdmin") {
      res.status(StatusCodes.FORBIDDEN).json({
        message: `Forbidden: Admin access required, cannot access with ${decoded.role} account`,
      });
      return;
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized: Invalid or expired token",
    });
  }
};
