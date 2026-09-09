import { ZodError } from "zod";
import { env } from "../../config/env.js";
import { errorResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return errorResponse(res, 400, JSON.stringify(err.flatten().fieldErrors));
  }

  if (err.name === "CastError") {
    return errorResponse(res, 400, "Invalid ID format");
  }
  if (err.code === 11000) {
    return errorResponse(
      res,
      409,
      `Duplicate value for: ${Object.keys(err.keyPattern)[0]}`,
    );
  }

  if (err instanceof AppError) {
    return errorResponse(res, err.statusCode, err.message);
  }

  console.error(err);

  return errorResponse(
    res,
    500,
    env.NODE_ENV === "development" ? err.message : "Something went wrong",
  );
};

export const notFoundHandler = (req, res) => {
  errorResponse(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};
