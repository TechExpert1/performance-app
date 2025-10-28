import { Request, Response } from "express";
import Sports from "../models/Sports.js";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";

export const getDropdownController = {
  // Get all sports with basic info
  getAllSports: async (req: Request, res: Response) => {
    try {
      const sports = await Sports.find()
        .select("_id name")
        .populate("sportsType", "name")
        .lean();

      res.status(200).json({
        message: "Sports fetched successfully",
        data: sports,
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
};
