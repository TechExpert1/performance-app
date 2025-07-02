import { Request } from "express";
import Career_Form from "../models/Career_Form.js";
import Early_Access_List from "../models/Early_Access_List.js";

export const submitcareerForm = async (req: Request) => {
  try {
    const data = {
      ...req.body,
      ...(req.fileUrl && { resume: req.fileUrl }),
    };

    const form = await Career_Form.create(data);
    return { message: "Career form submitted successfully", form };
  } catch (error) {
    throw error;
  }
};
export const submitEarlyAccessForm = async (req: Request) => {
  try {
    const form = await Early_Access_List.create(req.body);
    return { message: "Early access form submitted successfully", form };
  } catch (error) {
    throw error;
  }
};
