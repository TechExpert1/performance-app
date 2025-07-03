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

export const getAllCareerForm = async (req: Request) => {
  try {
    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filters
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const query: Record<string, any> = {};
    for (const key in filters) {
      if (filters[key]) {
        query[key] = filters[key];
      }
    }

    const forms = await Career_Form.find(query)
      .sort({ [sortBy as string]: sortDirection })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Career_Form.countDocuments(query);

    return {
      data: forms,
      total,
      page: pageNum,
      limit: limitNum,
    };
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
