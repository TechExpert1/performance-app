import { Request, Response } from "express";
import mongoose from "mongoose";
import UserSportCategory from "../models/User_Sport_Category.js";
import UserSportCategorySkill from "../models/User_Sport_Category_Skill.js";
import Sport from "../models/Sports.js";

export const sportCategoryController = {
  createCategory: async (req: Request, res: Response) => {
    try {
      const { name, sport, user } = req.body;
      if (!name || !sport) {
        res.status(400).json({ message: "Name and sport are required" });
        return;
      }
      const isValidSport = await Sport.findById(sport);
      if (!isValidSport) {
        res.status(404).json({ message: "Sport not found" });
        return;
      }
      const category = await UserSportCategory.create({ name, sport, user });
      res.status(201).json(category);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },

  updateCategory: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid category ID" });
        return;
      }
      const category = await UserSportCategory.findById(id);
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      if (name) category.name = name;
      await category.save();
      res.status(200).json(category);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },

  deleteCategory: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid category ID" });
        return;
      }
      const category = await UserSportCategory.findById(id);
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      await UserSportCategorySkill.deleteMany({ category: category._id });
      await category.deleteOne();
      res.status(200).json({ message: "Category and related skills deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },

  createSkill: async (req: Request, res: Response) => {
    try {
      const { name, category } = req.body;
      if (!name || !category) {
        res.status(400).json({ message: "Name and category are required" });
        return;
      }
      const isValidCategory = await UserSportCategory.findById(category);
      if (!isValidCategory) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      const skill = await UserSportCategorySkill.create({ name, category });
      res.status(201).json(skill);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },

  updateSkill: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid skill ID" });
        return;
      }
      const skill = await UserSportCategorySkill.findById(id);
      if (!skill) {
        res.status(404).json({ message: "Skill not found" });
        return;
      }
      if (name) skill.name = name;
      await skill.save();
      res.status(200).json(skill);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },

  deleteSkill: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid skill ID" });
        return;
      }
      const skill = await UserSportCategorySkill.findById(id);
      if (!skill) {
        res.status(404).json({ message: "Skill not found" });
        return;
      }
      await skill.deleteOne();
      res.status(200).json({ message: "Skill deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },

  getSportsWithCategoriesAndSkills: async (req: Request, res: Response) => {
    try {
      const { user } = req.query;
      if (!user || !mongoose.isValidObjectId(user)) {
        res.status(400).json({ message: "Valid user ID is required" });
        return;
      }

      const userId = new mongoose.Types.ObjectId(user as string);

      const sports = await Sport.aggregate([
        {
          $lookup: {
            from: "user_sport_categories",
            let: { sportId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$sport", "$$sportId"] },
                      { $eq: ["$user", userId] },
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: "user_sport_category_skills",
                  localField: "_id",
                  foreignField: "category",
                  as: "skills",
                },
              },
            ],
            as: "categories",
          },
        },
        {
          $match: { categories: { $ne: [] } },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            categories: 1,
          },
        },
      ]);

      res.status(200).json(sports);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },
};
