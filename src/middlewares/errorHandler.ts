import { NextFunction, Request, Response } from "express";
import { toApiError } from "../providers/prismaError";

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    const normalizedError = toApiError(err) as any;
    const statusCode = normalizedError.statusCode || 500;
    const errorCode = normalizedError.errorCode || "INTERNAL_SERVER_ERROR";
    const message = normalizedError.message || "Something went wrong on the server";
    const errors = normalizedError.errors || [];
  
    res.status(statusCode).json({
      success: false,
      statusCode,
      errorCode,
      message,
      errors,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
  };
  
  export default errorMiddleware; 
  