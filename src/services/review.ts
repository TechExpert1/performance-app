import { Request } from "express";
import Review from "../models/Review.js";
import { SortOrder } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/user.js";
import dayjs from "dayjs";
import { monthMap } from "../utils/commonConst.js";
export const createReview = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    return { message: "User information is missing from request." };
  }
  const data = {
    user: req.user.id,
    media: {
      type: req.body["media.type"],
      url: req.imageUrl,
    },
    ...req.body,
  };
  const review = await Review.create(data);
  return { message: "Review created successfully", data: review };
};

export const updateReview = async (req: AuthenticatedRequest) => {
  const { id } = req.params;

  const updateData: any = {};

  if (req.body["media.type"] && req.imageUrl) {
    updateData.media = {
      type: req.body["media.type"],
      url: req.imageUrl,
    };
  }

  const { media, "media.type": mediaType, ...rest } = req.body;

  Object.assign(updateData, rest);

  const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  return {
    message: "Review updated successfully",
    data: updatedReview,
  };
};

export const getReviewById = async (req: Request) => {
  const { id } = req.params;
  const review = await Review.findById(id).populate([
    "sport",
    "category",
    "skill",
  ]);
  if (!review) throw new Error("Review not found");
  return review;
};

export const removeReview = async (req: Request) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new Error("Review not found");
  return {
    message: "Review removed successfully",
  };
};

export const getAllReviews = async (req: Request) => {
  const {
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "desc",
    month,
    year,
    ...filters
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {};

  for (const key in filters) {
    if (filters[key]) {
      query[key] = filters[key];
    }
  }

  if (month && year) {
    const monthIndex = monthMap[month.toLowerCase()];
    const numericYear = Number(year);

    if (monthIndex !== undefined && !isNaN(numericYear)) {
      const startDate = dayjs()
        .year(numericYear)
        .month(monthIndex)
        .startOf("month")
        .toDate();
      const endDate = dayjs()
        .year(numericYear)
        .month(monthIndex)
        .endOf("month")
        .toDate();
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
  }

  const sortOption: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  if (page && limit) {
    const skip = (Number(page) - 1) * Number(limit);

    const data = await Review.find(query)
      .populate(["sport", "category", "skill"])
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    return {
      message: "Reviews fetched with pagination",
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        totalResults: total,
      },
    };
  }

  // Without pagination
  const data = await Review.find(query)
    .populate(["sport", "category", "skill"])
    .sort(sortOption);

  return {
    message: "Reviews fetched successfully",
    data,
  };
};
