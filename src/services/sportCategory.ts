import { Request } from "express";
import mongoose from "mongoose";
import SportCategory, {
  SportCategoryDocument,
} from "../models/Sport_Category.js";

interface ServiceResponse<T> {
  message: string;
  category?: T;
  data?: T[];
}

export const createSportCategory = async (
  req: Request
): Promise<ServiceResponse<SportCategoryDocument>> => {
  const { sportId } = req.params;
  const payload = {
    sport: new mongoose.Types.ObjectId(sportId),
    ...req.body,
  };

  const category = await SportCategory.create(payload);

  return {
    message: "Sport category created successfully",
    category,
  };
};

export const updateSportCategory = async (
  req: Request
): Promise<ServiceResponse<SportCategoryDocument>> => {
  const updated = await SportCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  if (!updated) return { message: "Sport category not found" };

  return {
    message: "Sport category updated successfully",
    category: updated,
  };
};

export const removeSportCategory = async (
  req: Request
): Promise<ServiceResponse<null>> => {
  const removed = await SportCategory.findByIdAndDelete(req.params.id);
  if (!removed) return { message: "Sport category not found" };

  return { message: "Sport category removed successfully" };
};

export const getSportCategoryById = async (
  req: Request
): Promise<SportCategoryDocument | { message: string }> => {
  const found = await SportCategory.findById(req.params.id).populate("sport");
  if (!found) return { message: "Sport category not found" };
  return found;
};

export const getAllSportCategories = async (
  req: Request
): Promise<ServiceResponse<SportCategoryDocument>> => {
  const { sportId } = req.params;

  const categories = await SportCategory.find({ sport: sportId }).populate(
    "sport"
  );

  return {
    message: "Categories fetched successfully",
    data: categories,
  };
};
