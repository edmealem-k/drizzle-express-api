import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured before the API starts");
}

export interface AuthRequest extends Request {
  userId?: number;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const match = /^Bearer\s+(\S+)$/i.exec(authHeader ?? "");

  if (!match) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = match[1]!;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || typeof decoded.userId !== "number") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
