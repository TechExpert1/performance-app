import { Request } from "express";
import mongoose, { SortOrder } from "mongoose";
import Sport, { SportDocument } from "../models/Sports.js";

interface ServiceResponse<T> {
  message: string;
  sport?: T;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

// Create a new sport
export const createSport = async (
  req: Request
): Promise<ServiceResponse<SportDocument>> => {
  const { sportsTypesId } = req.params;

  const sportsData = {
    sportsType: new mongoose.Types.ObjectId(sportsTypesId),
    ...req.body,
  };

  try {
    const newSport = await Sport.create(sportsData);
    return {
      message: "Sport created successfully",
      sport: newSport,
    };
  } catch (error) {
    throw error;
  }
};

// Update an existing sport
export const updateSport = async (
  req: Request
): Promise<ServiceResponse<SportDocument>> => {
  try {
    const updatedSport = await Sport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedSport) {
      return { message: "Sport not found" };
    }

    return {
      message: "Sport updated successfully",
      sport: updatedSport,
    };
  } catch (error) {
    throw error;
  }
};

// Remove a sport
export const removeSport = async (
  req: Request
): Promise<ServiceResponse<null>> => {
  try {
    const deletedSport = await Sport.findByIdAndDelete(req.params.id);

    if (!deletedSport) {
      return { message: "Sport not found" };
    }

    return {
      message: "Sport deleted successfully",
    };
  } catch (error) {
    throw error;
  }
};

// Get a sport by ID
export const getSportById = async (
  req: Request
): Promise<SportDocument | { message: string }> => {
  const { id } = req.params;

  try {
    const sport = await Sport.findById(id).populate("sportsType");

    if (!sport) {
      return { message: "Sport not found" };
    }

    return sport;
  } catch (error) {
    throw error;
  }
};

// Get all sports with optional filters, pagination, and sorting
export const getAllSports = async (
  req: Request
): Promise<ServiceResponse<SportDocument>> => {
  const {
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "asc",
    ...rawFilters
  } = req.query as Record<string, string>;

  const { sportsTypesId } = req.params;
  const filters: Record<string, any> = { sportsType: sportsTypesId };

  Object.entries(rawFilters).forEach(([key, value]) => {
    filters[key] = { $regex: value, $options: "i" };
  });

  const sortOption: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  try {
    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit);
      const data = await Sport.find(filters)
        .populate("sportsType")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));

      const total = await Sport.countDocuments(filters);

      return {
        message: "Sports fetched with pagination",
        data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
          totalResults: total,
        },
      };
    }

    const data = await Sport.find(filters)
      .populate("sportsType")
      .sort(sortOption);

    return {
      message: "Sports fetched successfully",
      data,
    };
  } catch (error) {
    throw error;
  }
};
