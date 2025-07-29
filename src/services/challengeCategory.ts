import { Request } from "express";

import ChallengeCategory from "../models/Challenge_Category.js";

export const getAllChallengeCategories = async (req: Request) => {
  try {
    const categoriesWithTypes = await ChallengeCategory.aggregate([
      // Sort categories in descending order
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "challenge_category_types", // collection name
          localField: "_id",
          foreignField: "challengeCategory",
          as: "types",
        },
      },
      {
        $addFields: {
          types: {
            $sortArray: {
              input: "$types",
              sortBy: { createdAt: -1 }, // sort types descending too
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          types: {
            _id: 1,
            name: 1,
            rules: 1,
          },
        },
      },
    ]);

    return categoriesWithTypes;
  } catch (error) {
    console.error("Error in getting challenge categories for dropdown:", error);
    throw error;
  }
};
