import { AppError } from "../../types/appError";
import { Request, Response } from "express";

const sendErrorDev = (err: AppError, req: Request, res: Response): Response => {
    console.log("DSffffffffffffffff")

    return res.status(err.statusCode || 500).json({
        message: err.message || "An error occurred",
        status: err.status || "error",
        error: err
    });

    
};

const sendErrorProd = (err: AppError, req: Request, res: Response): void => {
    if (req.originalUrl.startsWith("/api")) {
        if (err.isOperational) {
            res.status(err.statusCode || 500).json({
                message: err.message || "An error occurred",
                status: err.status || "error",
            });
        } else {
            console.error("Error 💣️💣️💣️", err);
            res.status(500).json({
                message: "Something went wrong",
                status: "error",
            });
            
        }
    }
};

export const globalErrorHandler = (err: AppError, req: Request, res: Response): void => {
    console.log("dsfdsfsfsdffeoirfe")
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        sendErrorProd(err, req, res);
    }
};
