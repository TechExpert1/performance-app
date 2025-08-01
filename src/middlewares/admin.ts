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
    const token = req.headers.authorization;
    if (!token) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Access Denied: No token provided" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AdminPayload;
    if (!decoded || decoded.role != "superAdmin") {
      res.status(StatusCodes.FORBIDDEN).json({
        message: `Forbidden: Admin access required, cant access with ${decoded.role} account`,
      });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};
