import { Request } from "express";
import UserPerformanceExercise from "../models/User_Performance_Exercise.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

// ✅ Create
export const handleCreate = async (req: AuthenticatedRequest) => {
  try {
    const user = req.user?.id;
    if (!user) throw new Error("User not authenticated");

    const exercise = await UserPerformanceExercise.create({
      ...req.body,
      user,
    });

    return {
      message: "User Performance Exercise created successfully",
      exercise,
    };
  } catch (error) {
    console.error("Error in handleCreate:", error);
    throw new Error((error as Error).message || "Failed to create exercise");
  }
};

// ✅ Update
export const handleUpdate = async (req: AuthenticatedRequest) => {
  try {
    const { id } = req.params;
    const user = req.user?.id;
    if (!user) throw new Error("User not authenticated");

    const updated = await UserPerformanceExercise.findByIdAndUpdate(
      id,
      { ...req.body, user },
      { new: true }
    );

    if (!updated) throw new Error("User Performance Exercise not found");

    return {
      message: "User Performance Exercise updated successfully",
      exercise: updated,
    };
  } catch (error) {
    console.error("Error in handleUpdate:", error);
    throw new Error((error as Error).message || "Failed to update exercise");
  }
};

// ✅ Delete
export const handleDelete = async (req: Request) => {
  try {
    const { id } = req.params;

    const deleted = await UserPerformanceExercise.findByIdAndDelete(id);
    if (!deleted) throw new Error("User Performance Exercise not found");

    return { message: "User Performance Exercise deleted successfully" };
  } catch (error) {
    console.error("Error in handleDelete:", error);
    throw new Error((error as Error).message || "Failed to delete exercise");
  }
};

// ✅ Show
export const handleShow = async (req: Request) => {
  try {
    const { id } = req.params;

    const exercise = await UserPerformanceExercise.findById(id)
      .populate("user")
      .populate("challengeCategory")
      .populate("subCategory")
      .lean();

    if (!exercise) throw new Error("User Performance Exercise not found");

    return exercise;
  } catch (error) {
    console.error("Error in handleShow:", error);
    throw new Error((error as Error).message || "Failed to fetch exercise");
  }
};

// ✅ Index
export const handleIndex = async (req: Request) => {
  try {
    const { user, challengeCategory, subCategory } = req.query;
    if (!(user && challengeCategory && subCategory)) {
      throw new Error(
        "user, challenge category and sub-category are required "
      );
    }

    const exercises = await UserPerformanceExercise.find({
      user,
      challengeCategory,
      subCategory,
    })
      .populate("challengeCategory")
      .populate("subCategory")
      .sort({ createdAt: -1 })
      .lean();

    return exercises;
  } catch (error) {
    console.error("Error in handleIndex:", error);
    throw new Error((error as Error).message || "Failed to fetch exercises");
  }
};
