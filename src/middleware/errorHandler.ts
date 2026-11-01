import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: "something went wrong",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
