import { Request } from "express";

import ChallengeCategoryType from "../models/Challenge_Category_Type.js";
import ChallengeCategoryTypeFormat from "../models/Challenge_Category_Type_Format.js";
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

    const types = await ChallengeCategoryType.find({
      challengeCategory: categoryId,
    });

    const typeIds = types.map((type) => type._id);

    await ChallengeCategoryTypeFormat.deleteMany({
      $or: [{ category: categoryId }, { type: { $in: typeIds } }],
    });

    await ChallengeCategoryType.deleteMany({ challengeCategory: categoryId });

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

    const existingType = await ChallengeCategoryType.findOne({
      challengeCategory: categoryId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingType) {
      throw new Error("Type with this name already exists for this category");
    }

    const newType = await ChallengeCategoryType.create({
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

    const existingType = await ChallengeCategoryType.findById(typeId);
    if (!existingType) {
      throw new Error("Challenge category type not found");
    }

    await ChallengeCategoryType.findByIdAndDelete(typeId);

    return { message: "Type and its related formats removed successfully" };
  } catch (error) {
    console.error("Error in removing type:", error);
    throw error;
  }
};
