import Joi from "joi";
import { Request, Response, NextFunction } from "express";

// User schema with custom error messages
const userSchema = Joi.object({
  name: Joi.string().optional().messages({
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
  phoneNumber: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other").optional().messages({
    "any.only": "Gender must be one of: male, female, other",
  }),
  role: Joi.string().valid("coach", "athlete", "gymOwner").optional().messages({
    "any.only": "Gender must be one of: coach, athlete, gymOwner",
  }),
  nationality: Joi.string().optional(),
  dob: Joi.date().optional().messages({
    "date.base": "Date of birth must be a valid date",
  }),
  referralSource: Joi.string().optional(),
}).unknown(true); // Allows additional fields

// Middleware for validating user payload
export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let userData = req.body.user;

  // Parse stringified JSON
  if (typeof userData === "string") {
    try {
      userData = JSON.parse(userData);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: "Invalid JSON in 'user' field",
      });
      return;
    }
  }

  const { error } = userSchema.validate(userData, { abortEarly: false });

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
    return;
  }

  next();
};
