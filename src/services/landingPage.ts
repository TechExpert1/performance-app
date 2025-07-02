import { Request } from "express";
import Career_Form from "../models/Career_Form.js";

export const submitForm = async (req: Request) => {
  try {
    const data = {
      ...req.body,
      ...(req.fileUrl && { resume: req.fileUrl }),
    };

    const form = await Career_Form.create(data);
    return { message: "Form submitted successfully", form };
  } catch (error) {
    throw error;
  }
};
