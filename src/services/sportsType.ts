import { Request } from "express";
import Sport_Type from "../models/Sports_Type.js";
import { ISportsType } from "../interfaces/sportsType.interface";
import { FilterQuery, SortOrder } from "mongoose";

// Create
export const createSportsType = async (req: Request) => {
  const { name } = req.body as ISportsType;

  try {
    const existing = await Sport_Type.findOne({ name });
    if (existing) {
      return { message: "SportsType with this name already exists" };
    }

    const newSportsType = await Sport_Type.create({ name });

    return {
      message: "SportsType created successfully",
      sportsType: newSportsType,
    };
  } catch (error) {
    throw error;
  }
};

// Update
export const updateSportsType = async (req: Request) => {
  const { id } = req.params;
  const updateData = req.body as Partial<ISportsType>;

  try {
    const sportsType = await Sport_Type.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!sportsType) {
      return { message: "SportsType not found" };
    }

    return {
      message: "SportsType updated successfully",
      sportsType,
    };
  } catch (error) {
    throw error;
  }
};

// Delete
export const removeSportsType = async (req: Request) => {
  const { id } = req.params;

  try {
    const sportsType = await Sport_Type.findByIdAndDelete(id);

    if (!sportsType) {
      return { message: "SportsType not found" };
    }

    return {
      message: "SportsType deleted successfully",
    };
  } catch (error) {
    throw error;
  }
};

// Get by ID
export const getSportsTypeById = async (req: Request) => {
  const { id } = req.params;

  try {
    const sportsType = await Sport_Type.findById(id);

    if (!sportsType) {
      return { message: "SportsType not found" };
    }

    return sportsType;
  } catch (error) {
    throw error;
  }
};

// Get all with filters, pagination, sorting
export const getAllSportsTypes = async (req: Request) => {
  const {
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "asc",
    ...rawFilters
  } = req.query as Record<string, string>;

  const filters: FilterQuery<ISportsType> = {};

  Object.keys(rawFilters).forEach((key) => {
    const value = rawFilters[key];
    if (typeof value === "string") {
      filters[key as keyof ISportsType] = { $regex: value, $options: "i" };
    }
  });

  const sortOption: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  try {
    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit);

      const data = await Sport_Type.find(filters)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));

      const total = await Sport_Type.countDocuments(filters);

      return {
        data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
          totalResults: total,
        },
      };
    }

    const data = await Sport_Type.find(filters).sort(sortOption);
    return { data };
  } catch (error) {
    throw error;
  }
};
