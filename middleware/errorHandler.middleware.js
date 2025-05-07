import { HTTPSTATUS } from "../config/http.config.js";
import { AppError } from "../utils/appError.js";
import { ZodError } from "zod"; 

const ErrorCodeEnum = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
};
const formatZodError = (res, error) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error(`Error Occured on path: ${req.path}`, err);
  if (err instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Invalid JSON format. Please check your request",
    });
  }
  if (err instanceof ZodError) {
    return formatZodError(res, err);
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errorCode: err.errorCode,
    });
  }
  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: err ? err.message : "Unknown Error",
  });
};
