import {AppError} from "../utility";
import {Request,Response,NextFunction} from "express";
    const message=`Invalid ${err.path}: ${err.value}`
    return new AppError(message,400);
}
const handleDuplicateFieldsDB=(err:AppError)=>{

    const message=`Duplicate field value ${err.errors![0]?.path}, Please enter another value`;
    return new AppError(message,400);
}
const handleJsonWebTokenError=()=>{
    const message=`Invalid token,Please login again`;
    return new AppError(message,401);
}
const handleTokenExpiredError=()=>{
    const message=`Tokes expired,Please login again`;
    return new AppError(message,401);
}
const sendErrorDev=(err:AppError,req:Request,res:Response)=>{
    if(req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            message: err.message,
            status: err.status,
            stack: err.stack,
            error: err
        })
    }
}
const sendErrorProd=(err:AppError,req:Request,res:Response)=>{
    if(req.originalUrl.startsWith("/api")) {
        if (err.isOperational) {
            return res.status(err.statusCode).json(
                {
                    message: err.message,
                    status: err.status,
                }
            )
        }
        //programming errors
        console.error("Error 💣️💣️💣️", err)
        return res.status(500).json(
            {
                message: "Something went wrong",
                status: "error",
            }
        )
    }
}
export const globalErrorHandler=(err:AppError,req:Request,res:Response,next:NextFunction)=>{
    err.statusCode=err.statusCode||500;
    err.status=err.status||"error";
    logger.error(err);
    if(process.env.NODE_ENV==='development'||process.env.NODE_ENV==='test'){
        sendErrorDev(err,req,res);
    }else if(process.env.NODE_ENV==='production'){
        sendErrorProd(error,req,res);
    }
}