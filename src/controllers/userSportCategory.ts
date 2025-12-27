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

      // Get user's selected sports from Athlete_User profile
      const athleteProfile = await mongoose.model("Athlete_User").findOne({ userId });
      const userSportIds = athleteProfile?.sportsAndSkillLevels?.map(
        (s: any) => new mongoose.Types.ObjectId(s.sport)
      ) || [];

      // Get user's gym membership to find gym-created custom categories/skills
      const GymMember = mongoose.model("Gym_Member");
      const gymMembership = await GymMember.findOne({ user: userId, status: "active" });
      const userGymId = gymMembership?.gym;

      // Aggregate system categories and skills
      const sportsWithSystemCategories = await Sport.aggregate([
        // Only include sports that user selected during signup
        {
          $match: {
            _id: { $in: userSportIds }
          }
        },
        {
          $lookup: {
            from: "sport_categories",
            localField: "_id",
            foreignField: "sport",
            as: "systemCategories",
          },
        },
        {
          $unwind: {
            path: "$systemCategories",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "sport_category_skills",
            localField: "systemCategories._id",
            foreignField: "category",
            as: "systemCategories.skills",
          },
        },
        // Add isCustom: false to system skills
        {
          $addFields: {
            "systemCategories.skills": {
              $map: {
                input: "$systemCategories.skills",
                as: "skill",
                in: { $mergeObjects: ["$$skill", { isCustom: false }] }
              }
            },
            "systemCategories.isCustom": false
          }
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            sportsType: { $first: "$sportsType" },
            skillLevelSet: { $first: "$skillLevelSet" },
            image: { $first: "$image" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            systemCategories: { $push: "$systemCategories" },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
            sportsType: 1,
            skillLevelSet: 1,
            createdAt: 1,
            updatedAt: 1,
            systemCategories: {
              $filter: {
                input: "$systemCategories",
                as: "cat",
                cond: { $and: [{ $ne: ["$$cat", null] }, { $ne: ["$$cat._id", null] }] },
              },
            },
          },
        },
        {
          $sort: { createdAt: 1 },
        },
      ]);

      // Get custom categories from Custom_Category model
      // Include categories created by the user OR by their gym
      const CustomCategory = mongoose.model("Custom_Category");
      const CustomSkill = mongoose.model("Custom_Skill");

      const customCategoryQuery: any = {
        sport: { $in: userSportIds },
        $or: [
          { createdBy: userId }
        ]
      };

      // Add gym condition if user is a gym member
      if (userGymId) {
        customCategoryQuery.$or.push({ gym: userGymId });
      }

      const customCategories = await CustomCategory.find(customCategoryQuery).lean();

      // Get ALL custom skills visible to user (they can belong to system OR custom categories)
      const customSkillQuery: any = {
        $or: [
          { createdBy: userId }
        ]
      };

      if (userGymId) {
        customSkillQuery.$or.push({ gym: userGymId });
      }

      const allCustomSkills = await CustomSkill.find(customSkillQuery).lean();

      // Group all custom skills by category ID
      const customSkillsByCategoryId: Record<string, any[]> = {};
      for (const skill of allCustomSkills) {
        const catId = skill.category.toString();
        if (!customSkillsByCategoryId[catId]) {
          customSkillsByCategoryId[catId] = [];
        }
        customSkillsByCategoryId[catId].push({ ...skill, isCustom: true });
      }

      // Build custom categories with their skills
      const customCategoriesWithSkills = customCategories.map((cat: any) => ({
        ...cat,
        isCustom: true,
        skills: customSkillsByCategoryId[cat._id.toString()] || []
      }));

      // Build a map of custom categories by sport
      const customCategoriesBySport: Record<string, any[]> = {};
      for (const cat of customCategoriesWithSkills) {
        const sportId = cat.sport.toString();
        if (!customCategoriesBySport[sportId]) {
          customCategoriesBySport[sportId] = [];
        }
        customCategoriesBySport[sportId].push(cat);
      }

      // Merge system and custom categories for each sport
      // Also add custom skills to system categories
      const result = sportsWithSystemCategories.map((sport) => {
        const sportId = sport._id.toString();
        const customCats = customCategoriesBySport[sportId] || [];

        // For each system category, append any custom skills that belong to it
        const systemCategoriesWithCustomSkills = (sport.systemCategories || []).map((sysCat: any) => {
          const customSkillsForSysCat = customSkillsByCategoryId[sysCat._id.toString()] || [];
          return {
            ...sysCat,
            skills: [...(sysCat.skills || []), ...customSkillsForSysCat]
          };
        });

        return {
          ...sport,
          categories: [...systemCategoriesWithCustomSkills, ...customCats],
          systemCategories: undefined, // Remove the temporary field
        };
      });

      // Clean up the response
      const cleanResult = result.map(({ systemCategories, ...rest }) => rest);

      res.status(200).json(cleanResult);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },
};
