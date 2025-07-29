import Joi from "joi";
import { Request, Response, NextFunction } from "express";

// Coach schema with custom error messages
const coachSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
    "string.empty": "Email cannot be empty",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password cannot be empty",
  }),
  role: Joi.string().valid("coach").required().messages({
    "any.only": "Role must be 'coach'",
    "any.required": "Role is required",
  }),
}).unknown(true); // Allow extra fields like profile image (handled via multipart)

// Middleware for validating coach creation payload
export const validateCoach = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let coachData = req.body;

  // Parse if sent as stringified JSON
  if (typeof coachData === "string") {
    try {
      coachData = JSON.parse(coachData);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: "Invalid JSON in request body",
      });
      return;
    }
  }

  const { error } = coachSchema.validate(coachData, { abortEarly: false });

  if (error) {
    res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
    return;
  }

  next();
};
