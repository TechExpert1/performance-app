import { Request } from "express";

import ChallengeCategoryExercise from "../models/Challenge_Category_Type.js";
import ChallengeCategoryFormat from "../models/Challenge_Category_Format.js";
import ChallengeCategory from "../models/Challenge_Category.js";

export const getAllChallengeCategoriesWithSubsAndExercises = async (
  req: Request
) => {
  try {
    const categories = await ChallengeCategory.aggregate([
      { $sort: { createdAt: -1 } },

      // lookup subcategories
      {
        $lookup: {
          from: "challenge_sub_categories",
          localField: "_id",
          foreignField: "challengeCategory",
          as: "subCategories",
        },
      },

      // for each subCategory, lookup exercises (strict: must match BOTH category + subCategory)
      {
        $lookup: {
          from: "challenge_sub_categories",
          localField: "_id",
          foreignField: "challengeCategory",
          as: "subCategories",
          pipeline: [
            {
              $lookup: {
                from: "challenge_category_exercises",
                let: {
                  categoryId: "$challengeCategory",
                  subCategoryId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$challengeCategory", "$$categoryId"] },
                          { $eq: ["$subCategory", "$$subCategoryId"] },
                        ],
                      },
                    },
                  },
                  { $sort: { createdAt: -1 } },
                  { $project: { _id: 1, name: 1, rules: 1 } },
                ],
                as: "exercises",
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                exercises: 1,
              },
            },
          ],
        },
      },

      // final projection
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          subCategories: 1,
        },
      },
    ]);

    return categories;
  } catch (error) {
    console.error("Error fetching challenge categories:", error);
    throw error;
  }
};

export const getAllChallengeCategories = async (req: Request) => {
  try {
    const categoriesWithTypesAndFormats = await ChallengeCategory.aggregate([
      { $sort: { createdAt: -1 } },

      {
        $lookup: {
          from: "challenge_category_exercises",
          localField: "_id",
          foreignField: "challengeCategory",
          as: "types",
        },
      },

      {
        $lookup: {
          from: "challenge_category_formats",
          localField: "_id",
          foreignField: "category",
          as: "formats",
        },
      },

      {
        $addFields: {
          types: {
            $sortArray: {
              input: "$types",
              sortBy: { createdAt: -1 },
            },
          },
          formats: {
            $sortArray: {
              input: "$formats",
              sortBy: { createdAt: -1 },
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
          formats: {
            _id: 1,
            name: 1,
          },
        },
      },
    ]);

    return categoriesWithTypesAndFormats;
  } catch (error) {
    console.error("Error in getting challenge categories for dropdown:", error);
    throw error;
  }
};

export const handleCreateChallenge = async (req: Request) => {
  try {
    const existingCategory = await ChallengeCategory.findOne({
      name: req.body.name,
    });
    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }
    const data = {
      ...req.body,
      image: (req as any).fileUrls?.image?.[0] || "",
    };
    console.log(data);
    const category = await ChallengeCategory.create(data);
    return category;
  } catch (error) {
    console.error("Error in creating category:", error);
    throw error;
  }
};

export const handleRemoveChallenge = async (req: Request) => {
  try {
    const categoryId = req.params.id;

    const existingCategory = await ChallengeCategory.findById(categoryId);
    if (!existingCategory) {
      throw new Error("Category not found");
    }

    const types = await ChallengeCategoryExercise.find({
      challengeCategory: categoryId,
    });

    const typeIds = types.map((type) => type._id);

    await ChallengeCategoryFormat.deleteMany({
      $or: [{ category: categoryId }, { type: { $in: typeIds } }],
    });

    await ChallengeCategoryExercise.deleteMany({
      challengeCategory: categoryId,
    });

    await ChallengeCategory.findByIdAndDelete(categoryId);

    return {
      message:
        "Category and its related types and formats removed successfully",
    };
  } catch (error) {
    console.error("Error in removing category:", error);
    throw error;
  }
};

export const handleCreateType = async (req: Request) => {
  try {
    const { name, rules } = req.body;
    const { categoryId } = req.params;

    if (!name) {
      throw new Error("Type name is required");
    }

    const category = await ChallengeCategory.findById(categoryId);
    if (!category) {
      throw new Error("Challenge category not found");
    }

    const existingType = await ChallengeCategoryExercise.findOne({
      challengeCategory: categoryId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingType) {
      throw new Error("Type with this name already exists for this category");
    }

    const newType = await ChallengeCategoryExercise.create({
      name: name.trim(),
      challengeCategory: categoryId,
      rules: rules || [],
    });

    return newType;
  } catch (error) {
    console.error("Error in creating type:", error);
    throw error;
  }
};

export const handleRemoveType = async (req: Request) => {
  try {
    const { typeId } = req.params;

    const existingType = await ChallengeCategoryExercise.findById(typeId);
    if (!existingType) {
      throw new Error("Challenge category type not found");
    }

    await ChallengeCategoryExercise.findByIdAndDelete(typeId);

    return { message: "Type and its related formats removed successfully" };
  } catch (error) {
    console.error("Error in removing type:", error);
    throw error;
  }
};
