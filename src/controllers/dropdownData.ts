import { Request, Response } from "express";
import Sports from "../models/Sports.js";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";
import Review from "../models/Review.js";
import SportCategory from "../models/Sport_Category.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";

export const getDropdownController = {
  // Get all sports with basic info
  getAllSports: async (req: Request, res: Response) => {
    try {
      const sports = await Sports.find()
        .select("_id name")
        .populate("sportsType", "name")
        .lean();

      // Custom sort order
      const sportOrder = [
        "Brazilian jiu jitsu (bjj)",
        "boxing",
        "reformer pilates",
        "yoga",
        "weight lifting",
        "weight training",
      ];

      const sortedSports = sports.sort((a, b) => {
        const indexA = sportOrder.indexOf(a.name);
        const indexB = sportOrder.indexOf(b.name);

        // If both are in the order list, sort by that order
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        // If only a is in the order list, it comes first
        if (indexA !== -1) {
          return -1;
        }
        // If only b is in the order list, it comes first
        if (indexB !== -1) {
          return 1;
        }
        // If neither is in the order list, maintain alphabetical order
        return a.name.localeCompare(b.name);
      });

      res.status(200).json({
        message: "Sports fetched successfully",
        data: sortedSports,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error fetching sports",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  // Get sport by ID with details
  getSportById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const sport = await Sports.findById(id)
        .populate("sportsType", "name")
        .lean();

      if (!sport) {
        res.status(404).json({ message: "Sport not found" });
        return;
      }

      res.status(200).json({
        message: "Sport fetched successfully",
        data: sport,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error fetching sport",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  // Get all exercises with basic info
  getAllExercises: async (req: Request, res: Response) => {
    try {
      const exercises = await ChallengeCategoryExercise.find()
        .select("_id name description")
        .populate("challengeCategory", "name")
        .populate("subCategory", "name")
        .lean();

      res.status(200).json({
        message: "Exercises fetched successfully",
        data: exercises,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error fetching exercises",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  // Get exercise by ID with details
  getExerciseById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const exercise = await ChallengeCategoryExercise.findById(id)
        .populate("challengeCategory", "name")
        .populate("subCategory", "name")
        .lean();

      if (!exercise) {
        res.status(404).json({ message: "Exercise not found" });
        return;
      }

      res.status(200).json({
        message: "Exercise fetched successfully",
        data: exercise,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error fetching exercise",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  // Get exercises by category
  getExercisesByCategory: async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;

      const exercises = await ChallengeCategoryExercise.find({
        challengeCategory: categoryId,
      })
        .select("_id name description")
        .populate("subCategory", "name")
        .lean();

      res.status(200).json({
        message: "Exercises fetched successfully",
        data: exercises,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error fetching exercises",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  // Get journals dropdown options for filters
  getJournalsFilterDropdowns: async (req: Request, res: Response) => {
    try {
      // Get unique sports from reviews
      const sports = await Sports.find()
        .select("_id name image")
        .lean();

      // Get unique session types from reviews
      const sessionTypes = await Review.distinct("sessionType", { sessionType: { $exists: true, $ne: null } });

      // Get unique match types from reviews
      const matchTypes = await Review.distinct("matchType", { matchType: { $exists: true, $ne: null } });

      // Get unique categories from reviews
      const categories = await SportCategory.find()
        .select("_id name")
        .lean();

      // Get unique skills from Sport_Category_Skill
      const skills = await SportCategorySkill.find()
        .select("_id name")
        .lean();

      res.status(200).json({
        message: "Journal filter dropdowns fetched successfully",
        data: {
          sports: sports.map((sport: any) => ({
            _id: sport._id,
            name: sport.name,
            image: sport.image,
          })),
          sessionTypes: sessionTypes.filter((st: string) => st && st.trim()).map((st: string) => ({
            value: st,
            label: st,
          })),
          matchTypes: matchTypes.filter((mt: string) => mt && mt.trim()).map((mt: string) => ({
            value: mt,
            label: mt,
          })),
          categories: categories.map((cat: any) => ({
            _id: cat._id,
            name: cat.name,
          })),
          skills: skills.map((skill: any) => ({
            _id: skill._id,
            name: skill.name,
          })),
        },
      });
    } catch (err) {
      res.status(500).json({
        message: "Error fetching journal filter dropdowns",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
};
