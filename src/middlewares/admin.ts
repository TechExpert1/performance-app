import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
interface UserPayload {
  _id: string;
}
declare global {
  namespace Express {
    interface Request {
      admin?: UserPayload;
    }
  }
}
export const verifyAdminToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    Jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Token not matched" });
        return;
      }
      const user = decoded as UserPayload;
      req.admin = user;
      next();
    });
  } else {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Access Denied Invalid Token" });
    return;
  }
};
